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

const getUserId = async (accId) => {
  const { data } = await supabase.from('USER').select('UserID').eq('AccID', accId).single();
  return data?.UserID || null;
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
  // GET /api/pets — public, returns available adoption pets
  if (req.method === 'GET') {
    try {
      const { data: userpets, error } = await supabase
        .from('USERPETS')
        .select(`
          UserID,
          PET ( PetID, PetName, PetBDay, PetSpecie, PetBreed, PetMarkings, PetGender, PetDetails, PetImg, PetAvailable, PetRegType, created_at ),
          USER ( UserID, UserName, ACCOUNT ( AccUserName ) )
        `)
        .eq('PET.PetAvailable', true)
        .eq('PET.PetRegType', 'Adoption');

      if (error) throw error;

      const pets = (userpets || [])
        .filter(row => row.PET)
        .map(row => ({
          ...row.PET,
          ownerId: row.UserID,
          owner_name: row.USER?.UserName || null,
          owner_username: row.USER?.ACCOUNT?.AccUserName || null,
        }));

      return res.json(pets);
    } catch (error) {
      return res.status(503).json({ error: 'Pets service temporarily unavailable', details: error.message });
    }
  }

  // POST /api/pets — auth required
  if (req.method === 'POST') {
    const user = getUser(req, res);
    if (!user) return;

    await runMiddleware(req, res, upload.single('image'));

    const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg, petRegType, vaccinationCard } = req.body;

    try {
      const username = await getUsername(user.accId);
      let imageUrl = petImg || null;
      if (req.file) imageUrl = await uploadToSupabase(req.file, 'pet-images', username);

      const { data: pet, error: petError } = await supabase
        .from('PET')
        .insert({
          PetName: petName, PetBDay: petBDay, PetSpecie: petSpecie, PetBreed: petBreed,
          PetMarkings: petMarkings, PetGender: petGender, PetDetails: petDetails,
          PetImg: imageUrl, PetRegType: petRegType, PetVaccinationCardFile: vaccinationCard || null,
        })
        .select()
        .single();

      if (petError) throw petError;

      const userId = await getUserId(user.accId);
      if (!userId) return res.status(404).json({ error: 'User not found' });

      const { error: linkError } = await supabase.from('USERPETS').insert({ UserID: userId, PetID: pet.PetID });
      if (linkError) throw linkError;

      return res.status(201).json(pet);
    } catch (error) {
      console.error('CREATE PET ERROR:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
