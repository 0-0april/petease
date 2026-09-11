const { supabase } = require('../../_lib/supabase');
const { getUserWithRole } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  try {
    const { data, error } = await supabase.from('USER').select('UserID, UserName, UserAddress, UserLastLogin, created_at, ACCOUNT ( AccEmail, AccStatus )');
    if (error) throw error;
    res.json((data || []).map(u => ({ UserID: u.UserID, UserName: u.UserName, UserAddress: u.UserAddress, UserLastLogin: u.UserLastLogin, created_at: u.created_at, AccEmail: u.ACCOUNT?.AccEmail, AccStatus: u.ACCOUNT?.AccStatus || 'Active' })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
