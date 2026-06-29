import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const toClientNotification = (notification) => ({
  id: notification.NotifID,
  title: notification.NotifTitle,
  message: notification.NotifMessage,
  type: notification.NotifType || 'general',
  isRead: notification.NotifRead,
  createdAt: notification.created_at
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('NOTIFICATION')
      .select('*')
      .eq('AccID', req.user.accId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(toClientNotification));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('NOTIFICATION')
      .update({ NotifRead: true })
      .eq('NotifID', req.params.id)
      .eq('AccID', req.user.accId)
      .select()
      .single();

    if (error) throw error;

    res.json(toClientNotification(data));
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
