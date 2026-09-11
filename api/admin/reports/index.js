import { supabase } from '../../_lib/supabase.js';
import { getUserWithRole } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('REPORTS')
      .select(`*, REPORTED_USER:USER!REPORTS_ReportedUser_fkey ( UserName, ACCOUNT ( AccStatus ) ), REPORTED_BY:USER!REPORTS_ReportedBy_fkey ( UserName )`)
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.json((data || []).map(r => ({
      id: r.ReportID, reportedUserId: r.ReportedUser, reportedByUserId: r.ReportedBy,
      reportedUserName: r.REPORTED_USER?.UserName || 'Unknown',
      reportedUserAccStatus: r.REPORTED_USER?.ACCOUNT?.AccStatus || 'Active',
      reportedByName: r.REPORTED_BY?.UserName || 'Unknown',
      reason: r.ReportReason, description: r.ReportDescription,
      messageLog: r.ReportMessageLog, status: r.ReportStatus, createdAt: r.created_at,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
