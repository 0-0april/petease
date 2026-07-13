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
      .select('UserID, UserName, UserAddress, UserLastLogin, created_at, ACCOUNT ( AccEmail )');

    if (error) throw error;

    res.json((data || []).map(u => ({
      UserID: u.UserID,
      UserName: u.UserName,
      UserAddress: u.UserAddress,
      UserLastLogin: u.UserLastLogin,
      created_at: u.created_at,
      AccEmail: u.ACCOUNT?.AccEmail,
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
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(r => ({
      id: r.ReportID,
      reportedUserId: r.ReportedUser,
      reportedByUserId: r.ReportedBy,
      reportedUserName: r.REPORTED_USER?.UserName || 'Unknown',
      reportedByName: r.REPORTED_BY?.UserName || 'Unknown',
      reason: r.ReportReason,
      description: r.ReportDescription,
      messageLog: r.ReportMessageLog,
      status: r.ReportStatus,
      createdAt: r.created_at,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH /api/admin/reports/:id/status ──────────────────────────────────
router.patch('/reports/:id/status', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { status, reportedUserId } = req.body;
  try {
    // Map UI action to exact report_status enum values
    const reportStatusMap = {
      'Resolved': 'Suspend',
      'Warning':  'Warning',
      'Closed':   'Dismiss',
    };
    const dbReportStatus = reportStatusMap[status] || 'Dismiss';

    const { error: reportError } = await supabase
      .from('REPORTS')
      .update({ ReportStatus: dbReportStatus })
      .eq('ReportID', req.params.id);

    if (reportError) throw reportError;

    // Only update ACCOUNT.AccStatus when action is Suspend
    if (status === 'Resolved' && reportedUserId) {
      const { data: userRow } = await supabase
        .from('USER')
        .select('AccID')
        .eq('UserID', reportedUserId)
        .single();

      if (userRow?.AccID) {
        const { error: accError } = await supabase
          .from('ACCOUNT')
          .update({ AccStatus: 'Suspended' })
          .eq('AccID', userRow.AccID);

        if (accError) throw accError;
      }
    }

    // Warning — update AccStatus to Warning (user can still log in, sees banner)
    if (status === 'Warning' && reportedUserId) {
      const { data: userRow } = await supabase
        .from('USER')
        .select('AccID')
        .eq('UserID', reportedUserId)
        .single();

      if (userRow?.AccID) {
        await supabase
          .from('ACCOUNT')
          .update({ AccStatus: 'Warning' })
          .eq('AccID', userRow.AccID);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update report status error:', error);
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

// ── GET /api/admin/users/chart ────────────────────────────────────────────
// Returns UserLastLogin timestamps for active-user line graph
router.get('/users/chart', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('USER')
      .select('UserLastLogin')
      .not('UserLastLogin', 'is', null);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
