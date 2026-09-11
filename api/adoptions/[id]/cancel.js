import { supabase } from '../../_lib/supabase.js';
import { getUser } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req, res);
  if (!user) return;

  const { id } = req.query;

  try {
    const { data, error } = await supabase
      .from('ADOPTION')
      .update({ AdoptStatus: 'Cancelled' })
      .eq('AdoptID', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Adoption not found' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
