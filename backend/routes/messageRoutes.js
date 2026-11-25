import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

// Helper: get UserID + UserName + AccID for an account
const getUserInfo = async (accId) => {
  const { data, error } = await supabase
    .from('USER')
    .select('UserID, UserName, AccID')
    .eq('AccID', accId)
    .single();
  if (error || !data) return null;
  return data;
};

// Helper: check if either user has blocked the other
const getBlockStatus = async (userIdA, userIdB) => {
  const { data } = await supabase
    .from('USERBLOCKS')
    .select('BlockID')
    .or(`and(BlockerID.eq.${userIdA},BlockedID.eq.${userIdB}),and(BlockerID.eq.${userIdB},BlockedID.eq.${userIdA})`);
  return (data || []).length > 0;
};

// Helper: check if a UserID belongs to a suspended account
const isSuspended = async (userId) => {
  const { data } = await supabase
    .from('USER')
    .select('ACCOUNT(AccStatus)')
    .eq('UserID', userId)
    .single();
  return data?.ACCOUNT?.AccStatus === 'Suspended';
};

// ── POST /api/messages ────────────────────────────��───────────────────────
router.post('/', authenticateToken, async (req, res) => {
  const { messTo, messContent } = req.body;
  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

    // Block check
    const blocked = await getBlockStatus(sender.UserID, messTo);
    if (blocked) return res.status(403).json({ error: 'You cannot message this user.' });

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

// ── GET /api/messages/conversations ──────────────────────────────────────
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

    // Get all blocks involving this user
    const { data: blocks } = await supabase
      .from('USERBLOCKS')
      .select('BlockerID, BlockedID')
      .or(`BlockerID.eq.${sender.UserID},BlockedID.eq.${sender.UserID}`);

    const blockedUserIds = new Set(
      (blocks || []).map(b =>
        b.BlockerID === sender.UserID ? b.BlockedID : b.BlockerID
      )
    );

    const { data: messages, error } = await supabase
      .from('MESSAGES')
      .select('MessFrom, MessTo, MessContent, MessTimeStamp, MessIsDeleted')
      .or(`MessFrom.eq.${sender.UserID},MessTo.eq.${sender.UserID}`)
      .order('MessTimeStamp', { ascending: false });

    if (error) throw error;

    // Collect unique other-user IDs (excluding blocked)
    const otherIds = [...new Set(
      (messages || []).map(m => m.MessFrom === sender.UserID ? m.MessTo : m.MessFrom)
    )].filter(id => !blockedUserIds.has(id));

    if (otherIds.length === 0) return res.json([]);

    // Fetch user info + account status for those IDs
    const { data: users } = await supabase
      .from('USER')
      .select('UserID, UserName, ACCOUNT(AccStatus)')
      .in('UserID', otherIds);

    // Filter out suspended users (hide from conversations list)
    const activeUsers = (users || []).filter(u => u.ACCOUNT?.AccStatus !== 'Suspended');
    const activeIds = new Set(activeUsers.map(u => u.UserID));
    const nameMap = Object.fromEntries(activeUsers.map(u => [u.UserID, u.UserName]));

    // Build conversation list (last non-deleted message per active user)
    const seen = new Set();
    const conversations = [];
    for (const m of messages || []) {
      if (m.MessIsDeleted) continue;
      const otherId = m.MessFrom === sender.UserID ? m.MessTo : m.MessFrom;
      if (!activeIds.has(otherId)) continue;
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

// ── GET /api/messages/with/:userId ───────────────────────────────────────
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
      .eq('MessIsDeleted', false)
      .order('MessTimeStamp', { ascending: true });

    if (error) throw error;

    const formatted = (messages || []).map(m => ({
      ...m,
      from_name: m.FROM_USER?.UserName || null,
      to_name: m.TO_USER?.UserName || null,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/messages/:id  (soft-delete: sets MessIsDeleted = TRUE) ───
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

// ── DELETE /api/messages/conversation/:userId  (soft-delete entire thread) ─
router.delete('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

    const otherId = req.params.userId;

    // Soft-delete all messages in both directions between these two users
    const { error } = await supabase
      .from('MESSAGES')
      .update({ MessIsDeleted: true })
      .or(
        `and(MessFrom.eq.${sender.UserID},MessTo.eq.${otherId}),and(MessFrom.eq.${otherId},MessTo.eq.${sender.UserID})`
      );

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/messages/block/:userId ─────────────────────────────────────
router.post('/block/:userId', authenticateToken, async (req, res) => {
  try {
    const blocker = await getUserInfo(req.user.accId);
    if (!blocker) return res.status(404).json({ error: 'User not found' });

    const blockedId = req.params.userId;

    // Idempotent — ignore if already blocked
    const { data: existing } = await supabase
      .from('USERBLOCKS')
      .select('BlockID')
      .eq('BlockerID', blocker.UserID)
      .eq('BlockedID', blockedId)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase
        .from('USERBLOCKS')
        .insert({ BlockerID: blocker.UserID, BlockedID: blockedId });
      if (error) throw error;
    }

    res.json({ success: true, blocked: true });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/messages/block/:userId  (unblock) ────────────────────────
router.delete('/block/:userId', authenticateToken, async (req, res) => {
  try {
    const blocker = await getUserInfo(req.user.accId);
    if (!blocker) return res.status(404).json({ error: 'User not found' });

    const { error } = await supabase
      .from('USERBLOCKS')
      .delete()
      .eq('BlockerID', blocker.UserID)
      .eq('BlockedID', req.params.userId);

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

    const otherId = req.params.userId;
    const { data } = await supabase
      .from('USERBLOCKS')
      .select('BlockerID, BlockedID')
      .or(`and(BlockerID.eq.${me.UserID},BlockedID.eq.${otherId}),and(BlockerID.eq.${otherId},BlockedID.eq.${me.UserID})`);

    const blocks = data || [];
    const iBlockedThem = blocks.some(b => b.BlockerID === me.UserID);
    const theyBlockedMe = blocks.some(b => b.BlockerID === otherId);

    res.json({ blocked: blocks.length > 0, iBlockedThem, theyBlockedMe });
  } catch (error) {
    console.error('Block status error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
