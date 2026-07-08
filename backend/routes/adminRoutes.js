import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { createNotificationsForUsers, createNotificationsForVets } from '../utils/notificationHelper.js';

const router = express.Router();

// ── GET /api/admin/users ──────────────────────────────────────────────────
router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('USER')
      .select('*, ACCOUNT ( AccUserName, AccEmail, AccPhoneNum )');

    if (error) throw error;

    res.json((data || []).map(u => ({
      ...u,
      AccUserName: u.ACCOUNT?.AccUserName,
      AccEmail: u.ACCOUNT?.AccEmail,
      AccPhoneNum: u.ACCOUNT?.AccPhoneNum,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/admin/reports ────────────────────────────────────────────────
router.get('/reports', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('REPORTS')
      .select(`
        *,
        REPORTED_USER:USER!REPORTS_ReportedUser_fkey ( UserName ),
        REPORTED_BY:USER!REPORTS_ReportedBy_fkey ( UserName )
      `);

    if (error) throw error;

    res.json((data || []).map(r => ({
      ...r,
      reported_user_name: r.REPORTED_USER?.UserName,
      reported_by_name: r.REPORTED_BY?.UserName,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/admin/announcements ─────────────────────────────────────────
router.post('/announcements', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { title, content, type } = req.body;

  try {
    // Get AdminID for this account
    const { data: adminRow, error: adminError } = await supabase
      .from('ADMIN')
      .select('AdminID')
      .eq('AccID', req.user.accId)
      .single();

    if (adminError || !adminRow) return res.status(404).json({ error: 'Admin not found' });

    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .insert({
        AnnounceTitle: title,
        AnnounceContent: content,
        AnnounceType: type,
        AnnouncedBy: adminRow.AdminID,
      })
      .select()
      .single();

    if (error) throw error;

    await createNotificationsForUsers({ title: title || 'New announcement', message: content, type: 'announcement' });
    await createNotificationsForVets({ title: title || 'New system announcement', message: content, type: 'announcement' });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
