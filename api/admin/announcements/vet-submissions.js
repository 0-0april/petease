const { supabase } = require('../../_lib/supabase');
const { getUserWithRole } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  try {
    const { data, error } = await supabase.from('ANNOUNCEMENT').select('*').is('AnnouncedBy', null).order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(a => ({ id: a.AnnounceID, title: a.AnnounceTitle, content: a.AnnounceContent, type: a.AnnounceType, createdAt: a.created_at, status: 'pending' })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
