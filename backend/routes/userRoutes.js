import express from 'express';
import pool from '../config/database.js';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.*, a."AccUserName", a."AccEmail", a."AccPhoneNum" FROM "USER" u JOIN "ACCOUNT" a ON u."AccID" = a."AccID" WHERE a."AccID" = $1',
      [req.user.accId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get announcements for users (from ANNOUNCEMENT table)
router.get('/announcements', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .select(`
        AnnounceID,
        AnnounceTitle,
        AnnounceContent,
        AnnounceType,
        AnnounceDateUpdated,
        created_at,
        ADMIN (
          AdminName
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const announcements = (data || []).map(a => ({
      id: a.AnnounceID,
      title: a.AnnounceTitle,
      content: a.AnnounceContent,
      type: a.AnnounceType,
      postedBy: a.ADMIN?.AdminName || 'Admin',
      createdAt: a.created_at,
      updatedAt: a.AnnounceDateUpdated
    }));

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
