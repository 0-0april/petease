const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  const { reportedUserId, reason, description, messageLog } = req.body;

  try {
    const { data: reporter } = await supabase.from('USER').select('UserID').eq('AccID', user.accId).single();
    if (!reporter) return res.status(404).json({ error: 'User not found' });

    const { data, error } = await supabase.from('REPORTS').insert({
      ReportedUser: reportedUserId, ReportedBy: reporter.UserID, ReportReason: reason,
      ReportDescription: description || null, ReportMessageLog: messageLog || null, ReportStatus: 'Open',
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
