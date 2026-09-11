import { supabase } from '../_lib/supabase.js';
import { getUser } from '../_lib/auth.js';
import multer from 'multer';

export const config = { api: { bodyParser: false } };

const upload = multer({ storage: multer.memoryStorage() });
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result))));

const getUsername = async (accId) => {
  const { data } = await supabase.from('ACCOUNT').select('AccUserName').eq('AccID', accId).single();
  return data?.AccUserName || 'user';
};

const uploadToSupabase = async (file, bucket, username) => {
  const fileExt = file.originalname.split('.').pop();
  const originalName = file.originalname.replace(/\.[^/.]+$/, '');
  const fileName = `${username}_${originalName}.${fileExt}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
  if (error) throw error;
  return fileName;
};

export default async function handler(req, res) {
  const { id } = req.query;

  // GET /api/pets/:id — public
  if (req.method === 'GET') {
    try {
      const { data: userpets, error } = await supabase
        .from('USERPETS')
        .select(`
          UserID,
          PET ( PetID, PetName, PetBDay, PetSpecie, PetBreed, PetMarkings, PetGender, PetDetails, PetImg, PetAvailable, PetRegType ),
          USER ( UserID, UserName, ACCOUNT ( AccUserName ) )
        `)
        .eq('PET.PetID', id)
        .single();

      if (error || !userpets?.PET) return res.status(404).json({ error: 'Pet not found' });

      return res.json({
        ...userpets.PET,
        ownerId: userpets.UserID,
        owner_name: userpets.USER?.UserName || null,
        owner_username: userpets.USER?.ACCOUNT?.AccUserName || null,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PUT /api/pets/:id — auth required
  if (req.method === 'PUT') {
    const user = getUser(req, res);
    if (!user) return;

    await runMiddleware(req, res, upload.single('image'));

    const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg, vaccinationCard } = req.body;

    try {
      const username = await getUsername(user.accId);
      let imageUrl = petImg || null;
      if (req.file) imageUrl = await uploadToSupabase(req.file, 'pet-images', username);

      const updatePayload = {
        PetName: petName, PetBDay: petBDay, PetSpecie: petSpecie, PetBreed: petBreed,
        PetMarkings: petMarkings, PetGender: petGender, PetDetails: petDetails, PetImg: imageUrl,
      };
      if (vaccinationCard !== undefined) updatePayload.PetVaccinationCardFile = vaccinationCard || null;

      const { data: pet, error } = await supabase
        .from('PET').update(updatePayload).eq('PetID', id).select().single();

      if (error) throw error;
      if (!pet) return res.status(404).json({ error: 'Pet not found' });

      return res.json(pet);
    } catch (error) {
      console.error('UPDATE PET ERROR:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/pets/:id — auth required
  if (req.method === 'DELETE') {
    const user = getUser(req, res);
    if (!user) return;

    try {
      const { error: linkError } = await supabase.from('USERPETS').delete().eq('PetID', id);
      if (linkError) throw linkError;

      const { error: petError } = await supabase.from('PET').delete().eq('PetID', id);
      if (petError) throw petError;

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
