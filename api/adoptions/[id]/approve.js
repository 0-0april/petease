const { supabase } = require('../../_lib/supabase');
const { getUser } = require('../../_lib/auth');
const { createNotification, createNotificationsForVets } = require('../../_lib/notifications');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  const { id } = req.query;
  try {
    const { data, error } = await supabase.from('ADOPTION').update({ AdoptStatus: 'Approved' }).eq('AdoptID', id)
      .select('AdoptID, USER!ADOPTION_UserID_fkey ( AccID ), USERPETS!ADOPTION_UserPetsID_fkey ( PET ( PetName ) )').single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Adoption not found' });

    const petName = data.USERPETS?.PET?.PetName || 'the pet';
    if (data.USER?.AccID) {
      await createNotification({ accId: data.USER.AccID, title: 'Adoption request approved', message: `Your adoption request for ${petName} was approved.`, type: 'adoption' });
    }
    await createNotificationsForVets({ title: 'Adoption approved — awaiting vet processing', message: `An adoption for ${petName} has been approved and is ready for vet waiver processing.`, type: 'adoption' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
