import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Upload a file to Supabase Storage and return the stored filename
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

// Helper: resolve the UserID for a given AccID
const getUserId = async (accId) => {
  const { data, error } = await supabase
    .from('USER')
    .select('UserID')
    .eq('AccID', accId)
    .single();
  if (error || !data) return null;
  return data.UserID;
};

// Helper: resolve the AccUserName for a given AccID
const getUsername = async (accId) => {
  const { data } = await supabase
    .from('ACCOUNT')
    .select('AccUserName')
    .eq('AccID', accId)
    .single();
  return data?.AccUserName || 'user';
};

// ── GET /api/pets  (public – available pets for adoption) ──────────────────
router.get('/', async (req, res) => {
  try {
    const { data: userpets, error } = await supabase
      .from('USERPETS')
      .select(`
        UserID,
        PET (
          PetID, PetName, PetBDay, PetSpecie, PetBreed,
          PetMarkings, PetGender, PetDetails, PetImg,
          PetAvailable, PetRegType
        ),
        USER (
          UserID, UserName,
          ACCOUNT ( AccUserName )
        )
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

    res.json(pets);
  } catch (error) {
    console.error('GET /api/pets error:', error);
    res.status(503).json({ error: 'Pets service temporarily unavailable', details: error.message });
  }
});

// ── GET /api/pets/my-pets  (auth required) ────────────────────────────────
router.get('/my-pets', authenticateToken, async (req, res) => {
  try {
    const userId = await getUserId(req.user.accId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const ownerUsername = await getUsername(req.user.accId);

    const { data: userpets, error } = await supabase
      .from('USERPETS')
      .select(`
        PET (
          PetID, PetName, PetBDay, PetSpecie, PetBreed,
          PetMarkings, PetGender, PetDetails, PetImg,
          PetAvailable, PetRegType
        )
      `)
      .eq('UserID', userId);

    if (error) throw error;

    const pets = (userpets || [])
      .map(row => row.PET)
      .filter(Boolean)
      .map(pet => ({ ...pet, owner_username: ownerUsername }));

    res.json(pets);
  } catch (error) {
    console.error('MY PETS ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/pets/:id  (public) ───────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data: userpets, error } = await supabase
      .from('USERPETS')
      .select(`
        UserID,
        PET (
          PetID, PetName, PetBDay, PetSpecie, PetBreed,
          PetMarkings, PetGender, PetDetails, PetImg,
          PetAvailable, PetRegType
        ),
        USER (
          UserID, UserName,
          ACCOUNT ( AccUserName )
        )
      `)
      .eq('PET.PetID', req.params.id)
      .single();

    if (error || !userpets?.PET) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({
      ...userpets.PET,
      ownerId: userpets.UserID,
      owner_name: userpets.USER?.UserName || null,
      owner_username: userpets.USER?.ACCOUNT?.AccUserName || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/pets  (auth required) ──────────────────────────────────────
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg, petRegType } = req.body;

  try {
    const username = await getUsername(req.user.accId);

    let imageUrl = petImg || null;
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file, 'pet-images', username);
    }

    const { data: pet, error: petError } = await supabase
      .from('PET')
      .insert({
        PetName: petName,
        PetBDay: petBDay,
        PetSpecie: petSpecie,
        PetBreed: petBreed,
        PetMarkings: petMarkings,
        PetGender: petGender,
        PetDetails: petDetails,
        PetImg: imageUrl,
        PetRegType: petRegType,
      })
      .select()
      .single();

    if (petError) throw petError;

    const userId = await getUserId(req.user.accId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const { error: linkError } = await supabase
      .from('USERPETS')
      .insert({ UserID: userId, PetID: pet.PetID });

    if (linkError) throw linkError;

    res.status(201).json(pet);
  } catch (error) {
    console.error('CREATE PET ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/pets/:id  (auth required) ───────────────────────────────────
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg } = req.body;

  try {
    const username = await getUsername(req.user.accId);

    let imageUrl = petImg || null;
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file, 'pet-images', username);
    }

    const { data: pet, error } = await supabase
      .from('PET')
      .update({
        PetName: petName,
        PetBDay: petBDay,
        PetSpecie: petSpecie,
        PetBreed: petBreed,
        PetMarkings: petMarkings,
        PetGender: petGender,
        PetDetails: petDetails,
        PetImg: imageUrl,
      })
      .eq('PetID', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    res.json(pet);
  } catch (error) {
    console.error('UPDATE PET ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/pets/:id  (auth required) ────────────────────────────────
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { error: linkError } = await supabase
      .from('USERPETS')
      .delete()
      .eq('PetID', req.params.id);

    if (linkError) throw linkError;

    const { error: petError } = await supabase
      .from('PET')
      .delete()
      .eq('PetID', req.params.id);

    if (petError) throw petError;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
