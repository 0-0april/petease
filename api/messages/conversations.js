const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  try {
    const { data: sender } = await supabase.from('USER').select('UserID, UserName').eq('AccID', user.accId).single();
    if (!sender) return res.status(404).json({ error: 'User not found' });

    const { data: messages, error } = await supabase.from('MESSAGES').select('MessFrom, MessTo, MessContent, MessTimeStamp')
      .or(`MessFrom.eq.${sender.UserID},MessTo.eq.${sender.UserID}`).order('MessTimeStamp', { ascending: false });
    if (error) throw error;

    const otherIds = [...new Set((messages || []).map(m => m.MessFrom === sender.UserID ? m.MessTo : m.MessFrom))];
    const { data: users } = await supabase.from('USER').select('UserID, UserName').in('UserID', otherIds);
    const nameMap = Object.fromEntries((users || []).map(u => [u.UserID, u.UserName]));

    const seen = new Set();
    const conversations = [];
    for (const m of messages || []) {
      const otherId = m.MessFrom === sender.UserID ? m.MessTo : m.MessFrom;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({ other_user_id: otherId, other_user_name: nameMap[otherId] || 'Unknown', last_message: m.MessContent, last_message_time: m.MessTimeStamp });
      }
    }
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
