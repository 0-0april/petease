import { supabase } from '../../../_lib/supabase.js';
import { getUserWithRole } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  const { id } = req.query;
  const { status, reportedUserId } = req.body;

  try {
    const reportStatusMap = { 'Resolved': 'Resolved', 'Warning': 'Under Review', 'Closed': 'Dismissed' };
    const dbReportStatus = reportStatusMap[status] || 'Dismissed';

    const { error: reportError } = await supabase.from('REPORTS').update({ ReportStatus: dbReportStatus }).eq('ReportID', id);
    if (reportError) throw reportError;

    if (status === 'Resolved' && reportedUserId) {
      const { data: userRow } = await supabase.from('USER').select('AccID').eq('UserID', reportedUserId).single();
      if (userRow?.AccID) {
        await supabase.from('ACCOUNT').update({ AccStatus: 'Suspended' }).eq('AccID', userRow.AccID);
      }
      await supabase.from('REPORTS').update({ ReportStatus: 'Resolved' })
        .eq('ReportedUser', reportedUserId).neq('ReportID', id).in('ReportStatus', ['Open', 'Under Review']);
    }

    if (status === 'Warning' && reportedUserId) {
      const { data: userRow } = await supabase.from('USER').select('AccID').eq('UserID', reportedUserId).single();
      if (userRow?.AccID) {
        await supabase.from('ACCOUNT').update({ AccStatus: 'Warning' }).eq('AccID', userRow.AccID);
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
