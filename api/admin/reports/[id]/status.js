const { supabase } = require('../../../_lib/supabase');
const { getUserWithRole } = require('../../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  const { id } = req.query;
  const { status, reportedUserId } = req.body;

  try {
    const statusMap = { 'Resolved': 'Resolved', 'Warning': 'Under Review', 'Closed': 'Dismissed' };
    await supabase.from('REPORTS').update({ ReportStatus: statusMap[status] || 'Dismissed' }).eq('ReportID', id);

    if (status === 'Resolved' && reportedUserId) {
      const { data: userRow } = await supabase.from('USER').select('AccID').eq('UserID', reportedUserId).single();
      if (userRow?.AccID) await supabase.from('ACCOUNT').update({ AccStatus: 'Suspended' }).eq('AccID', userRow.AccID);
      await supabase.from('REPORTS').update({ ReportStatus: 'Resolved' }).eq('ReportedUser', reportedUserId).neq('ReportID', id).in('ReportStatus', ['Open', 'Under Review']);
    }
    if (status === 'Warning' && reportedUserId) {
      const { data: userRow } = await supabase.from('USER').select('AccID').eq('UserID', reportedUserId).single();
      if (userRow?.AccID) await supabase.from('ACCOUNT').update({ AccStatus: 'Warning' }).eq('AccID', userRow.AccID);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
