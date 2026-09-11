const { supabase } = require('../../_lib/supabase');
const { getUser } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  const { id } = req.query;
  try {
    const { data, error } = await supabase.from('ADOPTION').update({ AdoptStatus: 'Cancelled' }).eq('AdoptID', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Adoption not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
