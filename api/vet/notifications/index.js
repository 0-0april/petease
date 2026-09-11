import { supabase } from '../../_lib/supabase.js';
import { getUserWithRole } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('NOTIFICATION').select('*').eq('AccID', user.accId).order('created_at', { ascending: false });
    if (error) throw error;

    res.json((data || []).map(n => ({
      id: n.NotifID, title: n.NotifTitle, message: n.NotifMessage,
      type: n.NotifType || 'general', isRead: n.NotifRead, createdAt: n.created_at,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
