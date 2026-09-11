import { supabase } from '../_lib/supabase.js';
import { getUser } from '../_lib/auth.js';
import { createNotification } from '../_lib/notifications.js';

const getUserInfo = async (accId) => {
  const { data } = await supabase.from('USER').select('UserID, UserName').eq('AccID', accId).single();
  return data || null;
};

export default async function handler(req, res) {
  // POST /api/messages — send a message
  if (req.method === 'POST') {
    const user = getUser(req, res);
    if (!user) return;

    const { messTo, messContent } = req.body;

    try {
      const sender = await getUserInfo(user.accId);
      if (!sender) return res.status(404).json({ error: 'User not found' });

      const { data: msg, error: msgError } = await supabase
        .from('MESSAGES')
        .insert({ MessFrom: sender.UserID, MessTo: messTo, MessContent: messContent })
        .select().single();

      if (msgError) throw msgError;

      const { data: receiver } = await supabase.from('USER').select('AccID').eq('UserID', messTo).single();
      if (receiver?.AccID) {
        await createNotification({
          accId: receiver.AccID,
          title: 'New message received',
          message: `${sender.UserName} sent you a message.`,
          type: 'message',
        });
      }

      return res.status(201).json(msg);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
