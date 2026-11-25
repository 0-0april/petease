import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

// Helper: get UserID + UserName for an account
const getUserInfo = async (accId) => {
  const { data, error } = await supabase
    .from('USER')
    .select('UserID, UserName')
    .eq('AccID', accId)
    .single();
  if (error || !data) return null;
  return data;
};

// Helper: check if a block exists between two users (either direction)
// Uses MessIsUserBlocked on the MESSAGES table
const getBlockStatusForPair = async (userIdA, userIdB) => {
  const { data } = await supabase
    .from('MESSAGES')
    .select('MessIsUserBlocked, MessFrom')
    .or(
      `and(MessFrom.eq.${userIdA},MessTo.eq.${userIdB}),and(MessFrom.eq.${userIdB},MessTo.eq.${userIdA})`
    )
    .eq('MessIsUserBlocked', true)
    .limit(1);

  if (!data || data.length === 0) return { blocked: false, iBlockedThem: false, theyBlockedMe: false };

  // The row that has MessIsUserBlocked=true tells us who initiated — MessFrom is the blocker
  const blockerRow = data[0];
  return {
    blocked: true,
    iBlockedThem: blockerRow.MessFrom === userIdA,
    theyBlockedMe: blockerRow.MessFrom === userIdB,
  };
};

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  const { messTo, messContent } = req.body;

  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

    // Block check — reject if either side has blocked the other
    const bs = await getBlockStatusForPair(sender.UserID, messTo);
    if (bs.blocked) return res.status(403).json({ error: 'You cannot message this user.' });

    const { data: msg, error: msgError } = await supabase
      .from('MESSAGES')
      .insert({ MessFrom: sender.UserID, MessTo: messTo, MessContent: messContent })
      .select()
      .single();

    if (msgError) throw msgError;

    // Notify receiver
    const { data: receiver } = await supabase
      .from('USER')
      .select('AccID')
      .eq('UserID', messTo)
      .single();

    if (receiver?.AccID) {
      await createNotification({
        accId: receiver.AccID,
        title: 'New message received',
        message: `${sender.UserName} sent you a message.`,
        type: 'message',
      });
    }

    res.status(201).json(msg);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all conversations (hide threads where the other user has blocked this user)
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

    const { data: messages, error } = await supabase
      .from('MESSAGES')
      .select('MessFrom, MessTo, MessContent, MessTimeStamp, MessIsUserBlocked')
      .or(`MessFrom.eq.${sender.UserID},MessTo.eq.${sender.UserID}`)
      .order('MessTimeStamp', { ascending: false });

    if (error) throw error;

    // Build a map: otherId → whether this thread is blocked
    // A thread is blocked if any message in it has MessIsUserBlocked = true
    const threadBlocked = new Map();
    for (const m of messages || []) {
      const otherId = m.MessFrom === sender.UserID ? m.MessTo : m.MessFrom;
      if (m.MessIsUserBlocked) threadBlocked.set(otherId, true);
      else if (!threadBlocked.has(otherId)) threadBlocked.set(otherId, false);
    }

    // Collect unique other-user IDs, excluding threads blocked BY the other user
    // (threads where I blocked them still show so I can unblock)
    const otherIds = [...new Set(
      (messages || []).map(m => m.MessFrom === sender.UserID ? m.MessTo : m.MessFrom)
    )];

    if (otherIds.length === 0) return res.json([]);

    // Fetch names
    const { data: users } = await supabase
      .from('USER')
      .select('UserID, UserName')
      .in('UserID', otherIds);

    const nameMap = Object.fromEntries((users || []).map(u => [u.UserID, u.UserName]));

    // Build conversation list (last message per user)
    const seen = new Set();
    const conversations = [];
    for (const m of messages || []) {
      const otherId = m.MessFrom === sender.UserID ? m.MessTo : m.MessFrom;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({
          other_user_id: otherId,
          other_user_name: nameMap[otherId] || 'Unknown',
          last_message: m.MessContent,
          last_message_time: m.MessTimeStamp,
        });
      }
    }

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a message (only sender can delete their own message)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

    const { data: msg } = await supabase
      .from('MESSAGES')
      .select('MessID, MessFrom')
      .eq('MessID', req.params.id)
      .single();

    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.MessFrom !== sender.UserID) return res.status(403).json({ error: 'Not authorised' });

    const { error } = await supabase
      .from('MESSAGES')
      .update({ MessIsDeleted: true })
      .eq('MessID', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages with a specific user
router.get('/with/:userId', authenticateToken, async (req, res) => {
  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

    const otherId = req.params.userId;

    const { data: messages, error } = await supabase
      .from('MESSAGES')
      .select('*, FROM_USER:USER!MESSAGES_MessFrom_fkey ( UserName ), TO_USER:USER!MESSAGES_MessTo_fkey ( UserName )')
      .or(
        `and(MessFrom.eq.${sender.UserID},MessTo.eq.${otherId}),and(MessFrom.eq.${otherId},MessTo.eq.${sender.UserID})`
      )
      .order('MessTimeStamp', { ascending: true });

    if (error) throw error;

    // Derive block status from the messages themselves
    const isBlocked = (messages || []).some(m => m.MessIsUserBlocked === true);
    const blockerRow = (messages || []).find(m => m.MessIsUserBlocked === true);
    const iBlockedThem = blockerRow ? blockerRow.MessFrom === sender.UserID : false;

    const formatted = (messages || []).map(m => ({
      ...m,
      from_name: m.FROM_USER?.UserName || null,
      to_name: m.TO_USER?.UserName || null,
      is_mine: m.MessFrom === sender.UserID,
    }));

    res.json({
      messages: formatted,
      blockStatus: {
        blocked: isBlocked,
        iBlockedThem,
        theyBlockedMe: isBlocked && !iBlockedThem,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/messages/block/:userId ─────────────────────────────────────
// Sets MessIsUserBlocked = true on all messages in the thread
router.post('/block/:userId', authenticateToken, async (req, res) => {
  try {
    const blocker = await getUserInfo(req.user.accId);
    if (!blocker) return res.status(404).json({ error: 'User not found' });

    const blockedId = req.params.userId;

    const { error } = await supabase
      .from('MESSAGES')
      .update({ MessIsUserBlocked: true })
      .or(
        `and(MessFrom.eq.${blocker.UserID},MessTo.eq.${blockedId}),and(MessFrom.eq.${blockedId},MessTo.eq.${blocker.UserID})`
      );

    if (error) throw error;
    res.json({ success: true, blocked: true });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/messages/block/:userId  (unblock) ────────────────────────
// Sets MessIsUserBlocked = false on all messages in the thread
router.delete('/block/:userId', authenticateToken, async (req, res) => {
  try {
    const blocker = await getUserInfo(req.user.accId);
    if (!blocker) return res.status(404).json({ error: 'User not found' });

    const { error } = await supabase
      .from('MESSAGES')
      .update({ MessIsUserBlocked: false })
      .or(
        `and(MessFrom.eq.${blocker.UserID},MessTo.eq.${req.params.userId}),and(MessFrom.eq.${req.params.userId},MessTo.eq.${blocker.UserID})`
      );

    if (error) throw error;
    res.json({ success: true, blocked: false });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/messages/block-status/:userId ───────────────────────────────
router.get('/block-status/:userId', authenticateToken, async (req, res) => {
  try {
    const me = await getUserInfo(req.user.accId);
    if (!me) return res.status(404).json({ error: 'User not found' });

    const bs = await getBlockStatusForPair(me.UserID, req.params.userId);
    res.json(bs);
  } catch (error) {
    console.error('Block status error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;