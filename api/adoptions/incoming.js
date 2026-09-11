const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  try {
    const { data: userData } = await supabase.from('USER').select('UserID, UserName').eq('AccID', user.accId).single();
    if (!userData) return res.status(404).json({ error: 'User not found' });

    const { data: userPets } = await supabase.from('USERPETS').select('UserPetID').eq('UserID', userData.UserID);
    const userPetIds = (userPets || []).map(u => u.UserPetID);
    if (!userPetIds.length) return res.json([]);

    const { data, error } = await supabase.from('ADOPTION').select(`
      AdoptID, AdoptReqDate, AdoptStatus, AdoptionWaiver,
      USERPETS!ADOPTION_UserPetsID_fkey ( PetID, PET ( PetName, PetImg, PetBreed ) ),
      USER!ADOPTION_UserID_fkey ( UserID, UserName, ACCOUNT ( AccEmail, AccPhoneNum ) )
    `).in('UserPetsID', userPetIds).order('AdoptReqDate', { ascending: false });
    if (error) throw error;

    res.json((data || []).map(a => ({
      ...a, PetName: a.USERPETS?.PET?.PetName, PetImg: a.USERPETS?.PET?.PetImg, PetBreed: a.USERPETS?.PET?.PetBreed,
      PetID: a.USERPETS?.PetID, AdopterUserID: a.USER?.UserID, adopter_name: a.USER?.UserName,
      adopter_email: a.USER?.ACCOUNT?.AccEmail, adopter_phone: a.USER?.ACCOUNT?.AccPhoneNum,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
