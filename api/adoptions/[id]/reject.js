import { supabase } from '../../_lib/supabase.js';
import { getUser } from '../../_lib/auth.js';
import { createNotification } from '../../_lib/notifications.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req, res);
  if (!user) return;

  const { id } = req.query;

  try {
    const { data, error } = await supabase
      .from('ADOPTION')
      .update({ AdoptStatus: 'Rejected' })
      .eq('AdoptID', id)
      .select(`
        AdoptID,
        USER!ADOPTION_UserID_fkey ( AccID ),
        USERPETS!ADOPTION_UserPetsID_fkey ( PET ( PetName ) )
      `)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Adoption not found' });

    const petName = data.USERPETS?.PET?.PetName || 'the pet';
    if (data.USER?.AccID) {
      await createNotification({
        accId: data.USER.AccID,
        title: 'Adoption request rejected',
        message: `Your adoption request for ${petName} was rejected.`,
        type: 'adoption',
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
