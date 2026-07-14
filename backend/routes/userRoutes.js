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

// Get announcements for users — only approved (AnnouncedBy IS NOT NULL)
router.get('/announcements', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .select(`
        AnnounceID, AnnounceTitle, AnnounceContent, AnnounceType,
        AnnounceDateUpdated, created_at, AnnouncedBy,
        ACCOUNT ( AccUserName )
      `)
      .not('AnnouncedBy', 'is', null)   // only approved announcements
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(a => ({
      id: a.AnnounceID,
      title: a.AnnounceTitle,
      content: a.AnnounceContent,
      type: a.AnnounceType,
      postedBy: a.ACCOUNT?.AccUserName || 'Admin',
      createdAt: a.created_at,
      updatedAt: a.AnnounceDateUpdated,
    })));
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit a user report
router.post('/report', authenticateToken, async (req, res) => {
  const { reportedUserId, reason, description, messageLog } = req.body;

  try {
    const { data: reporter } = await supabase
      .from('USER')
      .select('UserID')
      .eq('AccID', req.user.accId)
      .single();

    if (!reporter) return res.status(404).json({ error: 'User not found' });

    const { data, error } = await supabase
      .from('REPORTS')
      .insert({
        ReportedUser: reportedUserId,
        ReportedBy: reporter.UserID,
        ReportReason: reason,
        ReportDescription: description || null,
        ReportMessageLog: messageLog || null,
        ReportStatus: 'Open',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
