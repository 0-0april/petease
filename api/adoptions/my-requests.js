import { supabase } from '../_lib/supabase.js';
import { getUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req, res);
  if (!user) return;

  try {
    const { data: userData } = await supabase.from('USER').select('UserID, UserName').eq('AccID', user.accId).single();
    if (!userData) return res.status(404).json({ error: 'User not found' });

    const { data, error } = await supabase
      .from('ADOPTION')
      .select(`
        AdoptID, AdoptReqDate, AdoptStatus, AdoptionWaiver,
        USERPETS!ADOPTION_UserPetsID_fkey (
          PetID, UserPetID,
          USER ( UserID, UserName ),
          PET ( PetName, PetImg, PetBreed )
        )
      `)
      .eq('UserID', userData.UserID)
      .order('AdoptReqDate', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(a => ({
      ...a,
      PetName: a.USERPETS?.PET?.PetName,
      PetImg: a.USERPETS?.PET?.PetImg,
      PetBreed: a.USERPETS?.PET?.PetBreed,
      PetID: a.USERPETS?.PetID,
      OwnerUserID: a.USERPETS?.USER?.UserID,
      owner_name: a.USERPETS?.USER?.UserName,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
