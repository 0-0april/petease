const { supabase } = require('../../_lib/supabase');
const { getUser } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  const { userId } = req.query;
  try {
    const { data: sender } = await supabase.from('USER').select('UserID, UserName').eq('AccID', user.accId).single();
    if (!sender) return res.status(404).json({ error: 'User not found' });

    const { data: messages, error } = await supabase.from('MESSAGES')
      .select('*, FROM_USER:USER!MESSAGES_MessFrom_fkey ( UserName ), TO_USER:USER!MESSAGES_MessTo_fkey ( UserName )')
      .or(`and(MessFrom.eq.${sender.UserID},MessTo.eq.${userId}),and(MessFrom.eq.${userId},MessTo.eq.${sender.UserID})`)
      .order('MessTimeStamp', { ascending: true });
    if (error) throw error;

    res.json((messages || []).map(m => ({ ...m, from_name: m.FROM_USER?.UserName || null, to_name: m.TO_USER?.UserName || null })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
