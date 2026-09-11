const { supabase } = require('../../../_lib/supabase');
const { getUserWithRole } = require('../../../_lib/auth');
const { createNotificationsForUsers, createNotificationsForVets } = require('../../../_lib/notifications');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  const { id } = req.query;
  try {
    const { data, error } = await supabase.from('ANNOUNCEMENT').update({ AnnouncedBy: user.accId, AnnounceDateUpdated: new Date().toISOString() }).eq('AnnounceID', id).select().single();
    if (error) throw error;
    await createNotificationsForUsers({ title: data.AnnounceTitle, message: data.AnnounceContent, type: 'announcement' });
    await createNotificationsForVets({ title: data.AnnounceTitle, message: data.AnnounceContent, type: 'announcement' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
