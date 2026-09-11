const { supabase } = require('../../../_lib/supabase');
const { getUserWithRole } = require('../../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  const { userId } = req.query;
  try {
    const { data: userRow } = await supabase.from('USER').select('AccID').eq('UserID', userId).single();
    if (!userRow) return res.status(404).json({ error: 'User not found' });
    await supabase.from('ACCOUNT').update({ AccStatus: 'Suspended' }).eq('AccID', userRow.AccID);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
