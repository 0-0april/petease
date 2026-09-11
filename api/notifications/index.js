import { supabase } from '../_lib/supabase.js';
import { getUser } from '../_lib/auth.js';

const toClient = (n) => ({
  id: n.NotifID,
  title: n.NotifTitle,
  message: n.NotifMessage,
  type: n.NotifType || 'general',
  isRead: n.NotifRead,
  createdAt: n.created_at,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('NOTIFICATION')
      .select('*')
      .eq('AccID', user.accId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(toClient));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
