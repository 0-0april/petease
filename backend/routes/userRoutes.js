import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('USER')
      .select('*, ACCOUNT ( AccUserName, AccEmail, AccPhoneNum )')
      .eq('AccID', req.user.accId)
      .single();

    if (userError || !user) return res.status(404).json({ error: 'User not found' });

    res.json({
      ...user,
      AccUserName: user.ACCOUNT?.AccUserName,
      AccEmail: user.ACCOUNT?.AccEmail,
      AccPhoneNum: user.ACCOUNT?.AccPhoneNum,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get announcements for users
router.get('/announcements', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .select(`
        AnnounceID, AnnounceTitle, AnnounceContent, AnnounceType,
        AnnounceDateUpdated, created_at,
        ADMIN ( AdminName )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(a => ({
      id: a.AnnounceID,
      title: a.AnnounceTitle,
      content: a.AnnounceContent,
      type: a.AnnounceType,
      postedBy: a.ADMIN?.AdminName || 'Admin',
      createdAt: a.created_at,
      updatedAt: a.AnnounceDateUpdated,
    })));
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
