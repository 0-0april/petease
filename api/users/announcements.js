const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabase.from('ANNOUNCEMENT')
      .select('AnnounceID, AnnounceTitle, AnnounceContent, AnnounceType, AnnounceDateUpdated, created_at, AnnouncedBy, ACCOUNT ( AccUserName )')
      .not('AnnouncedBy', 'is', null).order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(a => ({
      id: a.AnnounceID, title: a.AnnounceTitle, content: a.AnnounceContent, type: a.AnnounceType,
      postedBy: a.ACCOUNT?.AccUserName || 'Admin', createdAt: a.created_at, updatedAt: a.AnnounceDateUpdated,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
