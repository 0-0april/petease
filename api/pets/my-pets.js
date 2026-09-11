const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  try {
    const { data: userData } = await supabase.from('USER').select('UserID').eq('AccID', user.accId).single();
    if (!userData) return res.status(404).json({ error: 'User not found' });

    const { data: accountData } = await supabase.from('ACCOUNT').select('AccUserName').eq('AccID', user.accId).single();
    const ownerUsername = accountData?.AccUserName || 'user';

    const { data: userpets, error } = await supabase.from('USERPETS')
      .select('PET ( PetID, PetName, PetBDay, PetSpecie, PetBreed, PetMarkings, PetGender, PetDetails, PetImg, PetAvailable, PetRegType, PetVaccinationCardFile )')
      .eq('UserID', userData.UserID);
    if (error) throw error;

    res.json((userpets || []).map(r => r.PET).filter(Boolean).map(pet => ({ ...pet, owner_username: ownerUsername })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
