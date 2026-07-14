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
      .select('UserID, UserName, UserAddress, UserLastLogin, created_at, ACCOUNT ( AccEmail, AccStatus )');

    if (error) throw error;

    res.json((data || []).map(u => ({
      UserID: u.UserID,
      UserName: u.UserName,
      UserAddress: u.UserAddress,
      UserLastLogin: u.UserLastLogin,
      created_at: u.created_at,
      AccEmail: u.ACCOUNT?.AccEmail,
      AccStatus: u.ACCOUNT?.AccStatus || 'Active',
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH /api/admin/users/:userId/suspend ───────────────────────────────
router.patch('/users/:userId/suspend', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { userId } = req.params;
  try {
    // Look up the AccID for this UserID
    const { data: userRow, error: userError } = await supabase
      .from('USER')
      .select('AccID')
      .eq('UserID', userId)
      .single();

    if (userError || !userRow) return res.status(404).json({ error: 'User not found' });

    const { error: accError } = await supabase
      .from('ACCOUNT')
      .update({ AccStatus: 'Suspended' })
      .eq('AccID', userRow.AccID);

    if (accError) throw accError;

    res.json({ success: true });
  } catch (error) {
    console.error('Suspend user error:', error);
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
        REPORTED_USER:USER!REPORTS_ReportedUser_fkey ( UserName, ACCOUNT ( AccStatus ) ),
        REPORTED_BY:USER!REPORTS_ReportedBy_fkey ( UserName )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(r => ({
      id: r.ReportID,
      reportedUserId: r.ReportedUser,
      reportedByUserId: r.ReportedBy,
      reportedUserName: r.REPORTED_USER?.UserName || 'Unknown',
      reportedUserAccStatus: r.REPORTED_USER?.ACCOUNT?.AccStatus || 'Active',
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
    // Map UI action to exact report_status enum values in DB
    // DB enum: 'Open', 'Under Review', 'Resolved', 'Dismissed'
    const reportStatusMap = {
      'Resolved': 'Resolved',   // Suspend action → report is Resolved
      'Warning':  'Under Review', // Warning action → report is Under Review
      'Closed':   'Dismissed',   // Dismiss action → report is Dismissed
    };
    const dbReportStatus = reportStatusMap[status] || 'Dismissed';

    const { error: reportError } = await supabase
      .from('REPORTS')
      .update({ ReportStatus: dbReportStatus })
      .eq('ReportID', req.params.id);

    if (reportError) throw reportError;

    // Suspend — update ACCOUNT.AccStatus to 'Suspended'
    // Also mark ALL other reports for this user as 'Resolved'
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

      // Bulk-resolve all remaining open/under-review reports for the same user
      await supabase
        .from('REPORTS')
        .update({ ReportStatus: 'Resolved' })
        .eq('ReportedUser', reportedUserId)
        .neq('ReportID', req.params.id)
        .in('ReportStatus', ['Open', 'Under Review']);
    }

    // Warning — update ACCOUNT.AccStatus to 'Warning'
    if (status === 'Warning' && reportedUserId) {
      const { data: userRow } = await supabase
        .from('USER')
        .select('AccID')
        .eq('UserID', reportedUserId)
        .single();

      if (userRow?.AccID) {
        const { error: accError } = await supabase
          .from('ACCOUNT')
          .update({ AccStatus: 'Warning' })
          .eq('AccID', userRow.AccID);

        if (accError) throw accError;
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/admin/announcements ──────────────────────────────────────────
// Returns admin-created announcements (AnnouncedBy references an ADMIN AccID)
router.get('/announcements', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Get all admin AccIDs to filter by
    const { data: adminAccs } = await supabase
      .from('ADMIN')
      .select('AccID');

    const adminAccIds = (adminAccs || []).map(a => a.AccID);

    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .select('*, ACCOUNT ( AccUserName )')
      .in('AnnouncedBy', adminAccIds.length ? adminAccIds : ['00000000-0000-0000-0000-000000000000'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(a => ({
      id: a.AnnounceID,
      title: a.AnnounceTitle,
      content: a.AnnounceContent,
      type: a.AnnounceType,
      createdAt: a.created_at,
      updatedAt: a.AnnounceDateUpdated,
      createdBy: a.ACCOUNT?.AccUserName || 'Admin',
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/admin/announcements/vet-submissions ───────────────────────────
// Returns vet-submitted announcements pending approval (AnnouncedBy IS NULL)
router.get('/announcements/vet-submissions', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .select('*')
      .is('AnnouncedBy', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(a => ({
      id: a.AnnounceID,
      title: a.AnnounceTitle,
      content: a.AnnounceContent,
      type: a.AnnounceType,
      createdAt: a.created_at,
      status: 'pending',
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/admin/announcements ─────────────────────────────────────────
router.post('/announcements', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { title, content, type } = req.body;
  try {
    // AnnouncedBy = admin's AccID (FK → ACCOUNT.AccID)
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .insert({
        AnnounceTitle: title,
        AnnounceContent: content,
        AnnounceType: type || 'General',
        AnnouncedBy: req.user.accId,
      })
      .select()
      .single();

    if (error) throw error;

    await createNotificationsForUsers({ title: title || 'New announcement', message: content, type: 'announcement' });
    await createNotificationsForVets({ title: title || 'New system announcement', message: content, type: 'announcement' });

    res.status(201).json({
      id: data.AnnounceID,
      title: data.AnnounceTitle,
      content: data.AnnounceContent,
      type: data.AnnounceType,
      createdAt: data.created_at,
      updatedAt: data.AnnounceDateUpdated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH /api/admin/announcements/:id/approve ────────────────────────────
// Approve a vet submission — set AnnouncedBy to admin's AccID
router.patch('/announcements/:id/approve', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .update({
        AnnouncedBy: req.user.accId,        // admin's AccID (FK → ACCOUNT.AccID)
        AnnounceDateUpdated: new Date().toISOString(),
      })
      .eq('AnnounceID', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await createNotificationsForUsers({ title: data.AnnounceTitle, message: data.AnnounceContent, type: 'announcement' });
    await createNotificationsForVets({ title: data.AnnounceTitle, message: data.AnnounceContent, type: 'announcement' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PATCH /api/admin/announcements/:id/edit-approve ───────────────────────
// Edit vet submission content then approve it in one step
router.patch('/announcements/:id/edit-approve', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { title, content, type } = req.body;
  try {
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .update({
        AnnounceTitle: title,
        AnnounceContent: content,
        AnnounceType: type || 'General',
        AnnouncedBy: req.user.accId,        // admin's AccID (FK → ACCOUNT.AccID)
        AnnounceDateUpdated: new Date().toISOString(),
      })
      .eq('AnnounceID', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await createNotificationsForUsers({ title: data.AnnounceTitle, message: data.AnnounceContent, type: 'announcement' });
    await createNotificationsForVets({ title: data.AnnounceTitle, message: data.AnnounceContent, type: 'announcement' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/admin/announcements/:id/reject ────────────────────────────
// Reject = delete the pending vet submission
router.delete('/announcements/:id/reject', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('ANNOUNCEMENT')
      .delete()
      .eq('AnnounceID', req.params.id)
      .is('AnnouncedBy', null); // safety: only delete pending ones

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/admin/announcements/:id ──────────────────────────────────────
// Edit an existing admin-created announcement
router.put('/announcements/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { title, content, type } = req.body;
  try {
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .update({
        AnnounceTitle: title,
        AnnounceContent: content,
        AnnounceType: type || 'General',
        AnnounceDateUpdated: new Date().toISOString(),
      })
      .eq('AnnounceID', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: data.AnnounceID,
      title: data.AnnounceTitle,
      content: data.AnnounceContent,
      type: data.AnnounceType,
      updatedAt: data.AnnounceDateUpdated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/admin/announcements/:id ───────────────────────────────────
router.delete('/announcements/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('ANNOUNCEMENT')
      .delete()
      .eq('AnnounceID', req.params.id);

    if (error) throw error;

    res.json({ success: true });
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
