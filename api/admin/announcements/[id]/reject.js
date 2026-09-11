const { supabase } = require('../../../_lib/supabase');
const { getUserWithRole } = require('../../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  const { id } = req.query;
  try {
    const { error } = await supabase.from('ANNOUNCEMENT').delete().eq('AnnounceID', id).is('AnnouncedBy', null);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
