const { supabase } = require('../../_lib/supabase');
const { getUser } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  const { id } = req.query;
  try {
    const { data, error } = await supabase.from('NOTIFICATION').update({ NotifRead: true })
      .eq('NotifID', id).eq('AccID', user.accId).select().single();
    if (error) throw error;
    res.json({ id: data.NotifID, title: data.NotifTitle, message: data.NotifMessage, type: data.NotifType || 'general', isRead: data.NotifRead, createdAt: data.created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
