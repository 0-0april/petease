import { supabase } from '../../../_lib/supabase.js';
import { getUserWithRole } from '../../../_lib/auth.js';
import { createNotification } from '../../../_lib/notifications.js';
import multer from 'multer';

export const config = { api: { bodyParser: false } };

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result))));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;

  await runMiddleware(req, res, upload.single('waiver'));

  try {
    const { service, notes, petId } = req.body;
    let waiverUrl = null;

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('adoption-waivers')
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('adoption-waivers').getPublicUrl(fileName);
      waiverUrl = publicUrl;
    }

    const { data: adoption, error: adoptError } = await supabase
      .from('ADOPTION')
      .update({ AdoptStatus: 'Completed', AdoptionWaiver: waiverUrl || 'Completed by vet staff' })
      .eq('AdoptID', id)
      .select(`AdoptID, USERPETS!ADOPTION_UserPetsID_fkey ( PET ( PetID, PetName ) )`)
      .single();
    if (adoptError) throw adoptError;

    if (service || notes) {
      await supabase.from('MEDICALHISTORY').insert({
        Medicine: service || 'Adoption Processing',
        Description: notes || 'Adoption completed and processed by vet staff',
      });
    }

    const petIdToUpdate = petId || adoption.USERPETS.PET.PetID;
    await supabase.from('PET').update({ PetAvailable: false }).eq('PetID', petIdToUpdate);

    // Cancel other pending requests for the same pet
    const { data: petUserpets } = await supabase.from('USERPETS').select('UserPetID').eq('PetID', petIdToUpdate);
    if (petUserpets?.length) {
      const userPetIds = petUserpets.map(u => u.UserPetID);
      const { data: otherRequests } = await supabase
        .from('ADOPTION')
        .select('AdoptID, USER!ADOPTION_UserID_fkey(AccID)')
        .in('UserPetsID', userPetIds)
        .in('AdoptStatus', ['Pending', 'Approved'])
        .neq('AdoptID', id);

      if (otherRequests?.length) {
        await supabase.from('ADOPTION').update({ AdoptStatus: 'Cancelled' }).in('AdoptID', otherRequests.map(r => r.AdoptID));
        for (const other of otherRequests) {
          if (other.USER?.AccID) {
            await createNotification({
              accId: other.USER.AccID,
              title: 'Adoption unavailable',
              message: `Sorry, ${adoption.USERPETS?.PET?.PetName || 'this pet'} has already been adopted by someone else.`,
              type: 'adoption',
            });
          }
        }
      }
    }

    // Notify adopter
    const { data: adopter } = await supabase
      .from('ADOPTION')
      .select(`USER ( AccID ), USERPETS ( PET ( PetName ) )`)
      .eq('AdoptID', id).single();
    if (adopter?.USER?.AccID) {
      await createNotification({
        accId: adopter.USER.AccID,
        title: 'Adoption completed',
        message: `The adoption process for ${adopter.USERPETS?.PET?.PetName || 'your pet'} was completed by vet staff.`,
        type: 'adoption',
      });
    }

    res.json({ success: true, adoption, waiverUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
