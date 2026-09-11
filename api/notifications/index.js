const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabase.from('NOTIFICATION').select('*')
      .eq('AccID', user.accId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(n => ({ id: n.NotifID, title: n.NotifTitle, message: n.NotifMessage, type: n.NotifType || 'general', isRead: n.NotifRead, createdAt: n.created_at })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
