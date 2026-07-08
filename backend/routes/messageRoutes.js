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

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  const { messTo, messContent } = req.body;

  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

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

// Get all conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

    const { data: messages, error } = await supabase
      .from('MESSAGES')
      .select('MessFrom, MessTo, MessContent, MessTimeStamp')
      .or(`MessFrom.eq.${sender.UserID},MessTo.eq.${sender.UserID}`)
      .order('MessTimeStamp', { ascending: false });

    if (error) throw error;

    // Collect unique other-user IDs
    const otherIds = [...new Set(
      (messages || []).map(m => m.MessFrom === sender.UserID ? m.MessTo : m.MessFrom)
    )];

    // Fetch names for those IDs
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

// Get messages with a specific user
router.get('/with/:userId', authenticateToken, async (req, res) => {
  try {
    const sender = await getUserInfo(req.user.accId);
    if (!sender) return res.status(404).json({ error: 'User not found' });

    const otherId = parseInt(req.params.userId);

    const { data: messages, error } = await supabase
      .from('MESSAGES')
      .select('*, FROM_USER:USER!MESSAGES_MessFrom_fkey ( UserName ), TO_USER:USER!MESSAGES_MessTo_fkey ( UserName )')
      .or(
        `and(MessFrom.eq.${sender.UserID},MessTo.eq.${otherId}),and(MessFrom.eq.${otherId},MessTo.eq.${sender.UserID})`
      )
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

export default router;
