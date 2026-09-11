import { supabase } from '../../../_lib/supabase.js';
import { getUserWithRole } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  const { userId } = req.query;

  try {
    const { data: userRow, error: userError } = await supabase.from('USER').select('AccID').eq('UserID', userId).single();
    if (userError || !userRow) return res.status(404).json({ error: 'User not found' });

    const { error: accError } = await supabase.from('ACCOUNT').update({ AccStatus: 'Suspended' }).eq('AccID', userRow.AccID);
    if (accError) throw accError;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
