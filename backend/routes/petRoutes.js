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

// ── POST /api/pets/upload-vaccination-card ────────────────────────────────
// Uploads vaccination card via backend (bypasses Supabase Storage RLS)
router.post('/upload-vaccination-card', authenticateToken, upload.single('vaccinationCard'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File must be under 5 MB' });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('pet-vaccinationcard')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('pet-vaccinationcard')
      .getPublicUrl(fileName);

    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Vaccination card upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/pets  (public – available pets for adoption) ──────────────────
router.get('/', async (req, res) => {
  try {
    // Optional auth — decode token if present so we can filter blocked owners
    let callerUserId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        const { data: callerRow } = await supabase
          .from('USER')
          .select('UserID')
          .eq('AccID', decoded.accId)
          .maybeSingle();
        callerUserId = callerRow?.UserID || null;
      } catch { /* treat as unauthenticated */ }
    }

    // If logged in, resolve all block relationships for this user
    let blockedOwnerIds = new Set();
    if (callerUserId) {
      const { data: blocks } = await supabase
        .from('USERBLOCKS')
        .select('BlockerID, BlockedID')
        .or(`BlockerID.eq.${callerUserId},BlockedID.eq.${callerUserId}`);
      blockedOwnerIds = new Set(
        (blocks || []).map(b =>
          b.BlockerID === callerUserId ? b.BlockedID : b.BlockerID
        )
      );
    }

    const { data: userpets, error } = await supabase
      .from('USERPETS')
      .select(`
        UserID,
        PET (
          PetID, PetName, PetBDay, PetSpecie, PetBreed,
          PetMarkings, PetGender, PetDetails, PetImg,
          PetAvailable, PetRegType, PetVaccinationCardFile, created_at
        ),
        USER (
          UserID, UserName,
          ACCOUNT ( AccUserName, AccStatus )
        )
      `)
      .eq('PET.PetAvailable', true)
      .in('PET.PetRegType', ['Adoption', 'Both']);

    if (error) throw error;

    const pets = (userpets || [])
      .filter(row =>
        row.PET &&
        row.USER?.ACCOUNT?.AccStatus !== 'Suspended' &&
        !blockedOwnerIds.has(row.UserID)          // hide pets from blocked/blocking users
      )
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
        UserPetID,
        PET (
          PetID, PetName, PetBDay, PetSpecie, PetBreed,
          PetMarkings, PetGender, PetDetails, PetImg,
          PetAvailable, PetRegType, PetVaccinationCardFile
        )
      `)
      .eq('UserID', userId)
      .or('UserPetIsDeleted.eq.false,UserPetIsDeleted.is.null');

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
          ACCOUNT ( AccUserName, AccStatus )
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
  const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg, petRegType, vaccinationCard } = req.body;

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
        PetVaccinationCardFile: vaccinationCard || null,
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
  const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg, petRegType, vaccinationCard } = req.body;

  try {
    const username = await getUsername(req.user.accId);

    let imageUrl = petImg || null;
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file, 'pet-images', username);
    }

    // Build update payload — only overwrite vaccination card if a new one was provided
    const updatePayload = {
      PetName: petName,
      PetBDay: petBDay,
      PetSpecie: petSpecie,
      PetBreed: petBreed,
      PetMarkings: petMarkings,
      PetGender: petGender,
      PetDetails: petDetails,
      PetImg: imageUrl,
    };

    if (petRegType) {
      updatePayload.PetRegType = petRegType;
    }

    if (vaccinationCard !== undefined) {
      updatePayload.PetVaccinationCardFile = vaccinationCard || null;
    }

    const { data: pet, error } = await supabase
      .from('PET')
      .update(updatePayload)
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

// ── GET /api/pets/:id/medical-history ────────────────────────────────────
// Role-aware: owners see their own (LogID NULL) + verified vet rows.
//             Vet staff see everything for the pet (all vet rows + owner rows).
//             Public (no token) sees only verified vet rows.
router.get('/:id/medical-history', async (req, res) => {
  try {
    // Resolve UserPetID from PetID
    const { data: upRow, error: upErr } = await supabase
      .from('USERPETS')
      .select('UserPetID, UserID')
      .eq('PetID', req.params.id)
      .single();

    if (upErr || !upRow) return res.status(404).json({ error: 'Pet not found' });

    // Determine caller role from token (optional auth)
    let callerRole = null;
    let callerUserId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const jwt = await import('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        callerRole = decoded.role;
        callerUserId = decoded.userId || decoded.accId;
      } catch (_) { /* treat as public */ }
    }

    // Fetch all rows for this pet with the service name join
    const { data: rows, error: medErr } = await supabase
      .from('MEDICALHISTORY')
      .select(`
        MedID,
        Medication,
        MedDescript,
        MedSumDiagnosis,
        MedVerified,
        LogID,
        created_at,
        APPOINTMENTLOGS (
          LogID,
          APPOINTMENT (
            SERVICES (
              ServType
            )
          )
        )
      `)
      .eq('UserPetID', upRow.UserPetID)
      .order('created_at', { ascending: false });

    if (medErr) throw medErr;

    // Apply visibility rules
    const filtered = (rows || []).filter(r => {
      const isVetEntered = r.LogID !== null;
      if (callerRole === 'vet') return true; // vet sees all
      if (isVetEntered) return r.MedVerified === true; // others see vet rows only when verified
      return true; // owner-entered rows visible to all
    });

    const result = filtered.map(r => ({
      medId: r.MedID,
      medication: r.Medication,
      medDescript: r.MedDescript,
      medVerified: r.MedVerified,
      medSumDiagnosis: r.MedSumDiagnosis || null,
      logId: r.LogID,
      serviceName: r.APPOINTMENTLOGS?.APPOINTMENT?.SERVICES?.ServType || null,
      createdAt: r.created_at,
    }));

    res.json(result);
  } catch (error) {
    console.error('GET medical-history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/pets/:id/medical-history  (owner, LogID=null) ───────────────
router.post('/:id/medical-history', authenticateToken, async (req, res) => {
  try {
    const { medication, medDescript } = req.body;
    if (!medication && !medDescript) {
      return res.status(400).json({ error: 'Provide at least Medication or Description.' });
    }

    // Resolve UserPetID and confirm it belongs to the caller
    const userId = await getUserId(req.user.accId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const { data: upRow, error: upErr } = await supabase
      .from('USERPETS')
      .select('UserPetID, UserID')
      .eq('PetID', req.params.id)
      .single();

    if (upErr || !upRow) return res.status(404).json({ error: 'Pet not found' });
    if (upRow.UserID !== userId) return res.status(403).json({ error: 'Not your pet' });

    const { data, error } = await supabase
      .from('MEDICALHISTORY')
      .insert({
        UserPetID: upRow.UserPetID,
        LogID: null,
        Medication: medication || '',
        MedDescript: medDescript || null,
        MedVerified: false,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({
      medId: data.MedID,
      medication: data.Medication,
      medDescript: data.MedDescript,
      medVerified: data.MedVerified,
      logId: null,
      serviceName: null,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('POST medical-history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/pets/:id/medical-history/owner  (owner updates own row) ──────
// Replaces the owner-entered row (LogID NULL) for this pet.
router.put('/:id/medical-history/owner', authenticateToken, async (req, res) => {
  try {
    const { medication, medDescript } = req.body;

    const userId = await getUserId(req.user.accId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const { data: upRow, error: upErr } = await supabase
      .from('USERPETS')
      .select('UserPetID, UserID')
      .eq('PetID', req.params.id)
      .single();

    if (upErr || !upRow) return res.status(404).json({ error: 'Pet not found' });
    if (upRow.UserID !== userId) return res.status(403).json({ error: 'Not your pet' });

    // Find existing owner row (LogID IS NULL) for this pet
    const { data: existing } = await supabase
      .from('MEDICALHISTORY')
      .select('MedID')
      .eq('UserPetID', upRow.UserPetID)
      .is('LogID', null)
      .maybeSingle();

    // If no content and no existing row, nothing to do
    if (!medication && !medDescript) {
      if (existing) {
        // Clear the row by deleting it
        await supabase.from('MEDICALHISTORY').delete().eq('MedID', existing.MedID);
      }
      return res.json({ success: true, deleted: true });
    }

    let data, error;
    if (existing) {
      ({ data, error } = await supabase
        .from('MEDICALHISTORY')
        .update({ Medication: medication || '', MedDescript: medDescript || null })
        .eq('MedID', existing.MedID)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from('MEDICALHISTORY')
        .insert({
          UserPetID: upRow.UserPetID,
          LogID: null,
          Medication: medication || '',
          MedDescript: medDescript || null,
          MedVerified: false,
        })
        .select()
        .single());
    }

    if (error) throw error;
    res.json({
      medId: data.MedID,
      medication: data.Medication,
      medDescript: data.MedDescript,
      medVerified: data.MedVerified,
      logId: null,
      serviceName: null,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('PUT medical-history/owner error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/pets/:id  (auth required — soft-delete) ──────────────────
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = await getUserId(req.user.accId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    // Soft-delete: mark the owner's USERPETS row as deleted
    const { error: linkError } = await supabase
      .from('USERPETS')
      .update({ UserPetIsDeleted: true })
      .eq('PetID', req.params.id)
      .eq('UserID', userId);

    if (linkError) throw linkError;

    // Mark pet unavailable so it no longer appears in Browse Pets
    await supabase
      .from('PET')
      .update({ PetAvailable: false })
      .eq('PetID', req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('DELETE PET ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
