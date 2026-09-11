const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');
const { createNotification } = require('../_lib/notifications');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  const { messTo, messContent } = req.body;
  try {
    const { data: sender } = await supabase.from('USER').select('UserID, UserName').eq('AccID', user.accId).single();
    if (!sender) return res.status(404).json({ error: 'User not found' });

    const { data: msg, error } = await supabase.from('MESSAGES')
      .insert({ MessFrom: sender.UserID, MessTo: messTo, MessContent: messContent }).select().single();
    if (error) throw error;

    const { data: receiver } = await supabase.from('USER').select('AccID').eq('UserID', messTo).single();
    if (receiver?.AccID) {
      await createNotification({ accId: receiver.AccID, title: 'New message received', message: `${sender.UserName} sent you a message.`, type: 'message' });
    }
    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
