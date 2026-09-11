const { supabase } = require('../../_lib/supabase');
const { getUserWithRole } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  try {
    const { data, error } = await supabase.from('USER').select('UserLastLogin').not('UserLastLogin', 'is', null);
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
