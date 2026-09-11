const { supabase } = require('../../_lib/supabase');
const { getUserWithRole } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const { data, error, count } = await supabase.from('ADOPTION').select(`
      AdoptID, AdoptReqDate, AdoptStatus, AdoptionWaiver, created_at,
      USER!ADOPTION_UserID_fkey ( UserID, UserName, ACCOUNT ( AccEmail, AccPhoneNum ) ),
      USERPETS!ADOPTION_UserPetsID_fkey ( UserPetID, PET ( PetID, PetName, PetBreed, PetImg ) )
    `, { count: 'exact' }).in('AdoptStatus', ['Approved', 'Completed'])
      .order('AdoptReqDate', { ascending: false }).range(startIndex, startIndex + limit - 1);
    if (error) throw error;

    res.json({
      adoptions: (data || []).map(a => ({
        id: a.AdoptID, petId: a.USERPETS.PET.PetID, petName: a.USERPETS.PET.PetName,
        petBreed: a.USERPETS.PET.PetBreed, petImage: a.USERPETS.PET.PetImg,
        adopterName: a.USER.UserName, adopterEmail: a.USER.ACCOUNT.AccEmail, adopterPhone: a.USER.ACCOUNT.AccPhoneNum || 'N/A',
        status: a.AdoptStatus.toLowerCase(), createdAt: a.AdoptReqDate, waiverDocument: a.AdoptionWaiver, message: '',
        completedAt: a.AdoptStatus === 'Completed' ? a.created_at : null,
      })),
      total: count, page, totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
