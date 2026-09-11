import { supabase } from '../_lib/supabase.js';
import { getUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('SERVICES')
      .select('ServID, ServType, ServDayAvailable, ServEndDate, ServSlot, ServStatus')
      .eq('ServStatus', 'Active')
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json((data || []).map(s => ({
      id: s.ServID,
      name: s.ServType,
      daysAvailable: s.ServDayAvailable || [],
      specificDate: s.ServEndDate || null,
      slots: s.ServSlot,
      status: s.ServStatus,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
