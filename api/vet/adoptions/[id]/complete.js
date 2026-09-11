const { supabase } = require('../../../_lib/supabase');
const { getUserWithRole } = require('../../../_lib/auth');
const { createNotification } = require('../../../_lib/notifications');
const { parseMultipart } = require('../../../_lib/parseMultipart');

module.exports.config = { api: { bodyParser: false } };

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;
  try {
    const { fields, files } = await parseMultipart(req);
    const { service, notes, petId } = fields;

    let waiverUrl = null;
    if (files.waiver) {
      const file = files.waiver;
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: upErr } = await supabase.storage.from('adoption-waivers').upload(fileName, file.buffer, { contentType: file.mimetype });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('adoption-waivers').getPublicUrl(fileName);
      waiverUrl = publicUrl;
    }

    const { data: adoption, error: adoptError } = await supabase.from('ADOPTION')
      .update({ AdoptStatus: 'Completed', AdoptionWaiver: waiverUrl || 'Completed by vet staff' })
      .eq('AdoptID', id).select('AdoptID, USERPETS!ADOPTION_UserPetsID_fkey ( PET ( PetID, PetName ) )').single();
    if (adoptError) throw adoptError;

    if (service || notes) {
      await supabase.from('MEDICALHISTORY').insert({ Medicine: service || 'Adoption Processing', Description: notes || 'Adoption completed and processed by vet staff' });
    }

    const petIdToUpdate = petId || adoption.USERPETS.PET.PetID;
    await supabase.from('PET').update({ PetAvailable: false }).eq('PetID', petIdToUpdate);

    const { data: petUserpets } = await supabase.from('USERPETS').select('UserPetID').eq('PetID', petIdToUpdate);
    if (petUserpets?.length) {
      const userPetIds = petUserpets.map(u => u.UserPetID);
      const { data: others } = await supabase.from('ADOPTION').select('AdoptID, USER!ADOPTION_UserID_fkey(AccID)')
        .in('UserPetsID', userPetIds).in('AdoptStatus', ['Pending', 'Approved']).neq('AdoptID', id);
      if (others?.length) {
        await supabase.from('ADOPTION').update({ AdoptStatus: 'Cancelled' }).in('AdoptID', others.map(r => r.AdoptID));
        for (const other of others) {
          if (other.USER?.AccID) {
            await createNotification({ accId: other.USER.AccID, title: 'Adoption unavailable', message: `Sorry, ${adoption.USERPETS?.PET?.PetName || 'this pet'} has already been adopted by someone else.`, type: 'adoption' });
          }
        }
      }
    }

    const { data: adopter } = await supabase.from('ADOPTION').select('USER ( AccID ), USERPETS ( PET ( PetName ) )').eq('AdoptID', id).single();
    if (adopter?.USER?.AccID) {
      await createNotification({ accId: adopter.USER.AccID, title: 'Adoption completed', message: `The adoption process for ${adopter.USERPETS?.PET?.PetName || 'your pet'} was completed by vet staff.`, type: 'adoption' });
    }

    res.json({ success: true, adoption, waiverUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
