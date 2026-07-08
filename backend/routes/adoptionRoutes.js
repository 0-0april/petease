import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { createNotification, createNotificationsForVets } from '../utils/notificationHelper.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const uploadToSupabase = async (file, bucket) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrl;
};

// Helper: resolve UserID + UserName for an accId
const getUserInfo = async (accId) => {
  const { data, error } = await supabase
    .from('USER')
    .select('UserID, UserName')
    .eq('AccID', accId)
    .single();
  if (error || !data) return null;
  return data;
};

// ── POST /api/adoptions  (create adoption request) ────────────────────────
router.post('/', authenticateToken, upload.single('waiver'), async (req, res) => {
  const { userPetId } = req.body;

  try {
    const adopter = await getUserInfo(req.user.accId);
    if (!adopter) return res.status(404).json({ error: 'User not found' });

    // Resolve UserPetID and owner info from the pet's USERPETS entry
    const { data: userPetRow, error: upError } = await supabase
      .from('USERPETS')
      .select(`
        UserPetID,
        PET ( PetName ),
        USER ( AccID )
      `)
      .eq('PetID', userPetId)
      .single();

    if (upError || !userPetRow) return res.status(404).json({ error: 'Pet not found in USERPETS table' });

    let waiverUrl = null;
    if (req.file) waiverUrl = await uploadToSupabase(req.file, 'adoption-waivers');

    const { data: adoption, error: adoptError } = await supabase
      .from('ADOPTION')
      .insert({ UserID: adopter.UserID, UserPetsID: userPetRow.UserPetID, AdoptionWaiver: waiverUrl })
      .select()
      .single();

    if (adoptError) throw adoptError;

    await createNotification({
      accId: userPetRow.USER?.AccID,
      title: 'New adoption request',
      message: `${adopter.UserName} requested to adopt ${userPetRow.PET?.PetName}.`,
      type: 'adoption',
    });

    res.status(201).json(adoption);
  } catch (error) {
    console.error('Adoption creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/adoptions/:id/waiver ────────────────────────────────────────
router.post('/:id/waiver', authenticateToken, upload.single('waiver'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const waiverUrl = await uploadToSupabase(req.file, 'adoption-waivers');

    const { data, error } = await supabase
      .from('ADOPTION')
      .update({ AdoptionWaiver: waiverUrl })
      .eq('AdoptID', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Adoption not found' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/adoptions/my-requests ───────────────────────────────────────
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const user = await getUserInfo(req.user.accId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data, error } = await supabase
      .from('ADOPTION')
      .select(`
        AdoptID, AdoptReqDate, AdoptStatus, AdoptionWaiver,
        USERPETS!ADOPTION_UserPetsID_fkey (
          PetID,
          UserPetID,
          USER ( UserID, UserName ),
          PET ( PetName, PetImg, PetBreed )
        )
      `)
      .eq('UserID', user.UserID)
      .order('AdoptReqDate', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(a => ({
      ...a,
      PetName: a.USERPETS?.PET?.PetName,
      PetImg: a.USERPETS?.PET?.PetImg,
      PetBreed: a.USERPETS?.PET?.PetBreed,
      PetID: a.USERPETS?.PetID,
      OwnerUserID: a.USERPETS?.USER?.UserID,
      owner_name: a.USERPETS?.USER?.UserName,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/adoptions/incoming ───────────────────────────────────────────
router.get('/incoming', authenticateToken, async (req, res) => {
  try {
    const user = await getUserInfo(req.user.accId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find all USERPETS entries for this user's pets
    const { data: userPets, error: upError } = await supabase
      .from('USERPETS')
      .select('UserPetID')
      .eq('UserID', user.UserID);

    if (upError) throw upError;

    const userPetIds = (userPets || []).map(u => u.UserPetID);
    if (userPetIds.length === 0) return res.json([]);

    const { data, error } = await supabase
      .from('ADOPTION')
      .select(`
        AdoptID, AdoptReqDate, AdoptStatus, AdoptionWaiver,
        USERPETS!ADOPTION_UserPetsID_fkey (
          PetID,
          PET ( PetName, PetImg, PetBreed )
        ),
        USER!ADOPTION_UserID_fkey (
          UserID, UserName,
          ACCOUNT ( AccEmail, AccPhoneNum )
        )
      `)
      .in('UserPetsID', userPetIds)
      .order('AdoptReqDate', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(a => ({
      ...a,
      PetName: a.USERPETS?.PET?.PetName,
      PetImg: a.USERPETS?.PET?.PetImg,
      PetBreed: a.USERPETS?.PET?.PetBreed,
      PetID: a.USERPETS?.PetID,
      AdopterUserID: a.USER?.UserID,
      adopter_name: a.USER?.UserName,
      adopter_email: a.USER?.ACCOUNT?.AccEmail,
      adopter_phone: a.USER?.ACCOUNT?.AccPhoneNum,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Helper: update adoption status + notify ───────────────────────────────
const updateAdoptionStatus = async (id, status, notifyAdopter, notifyVets) => {
  const { data, error } = await supabase
    .from('ADOPTION')
    .update({ AdoptStatus: status })
    .eq('AdoptID', id)
    .select(`
      AdoptID,
      USER!ADOPTION_UserID_fkey ( AccID ),
      USERPETS!ADOPTION_UserPetsID_fkey ( PET ( PetName ) )
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Adoption not found');

  const petName = data.USERPETS?.PET?.PetName || 'the pet';
  const adopterAccId = data.USER?.AccID;

  if (notifyAdopter && adopterAccId) {
    await createNotification({ accId: adopterAccId, ...notifyAdopter(petName), type: 'adoption' });
  }
  if (notifyVets) {
    await createNotificationsForVets({ ...notifyVets(petName), type: 'adoption' });
  }
  return data;
};

router.put('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const data = await updateAdoptionStatus(
      req.params.id, 'Approved',
      (name) => ({ title: 'Adoption request approved', message: `Your adoption request for ${name} was approved.` }),
      (name) => ({ title: 'Adoption approved — awaiting vet processing', message: `An adoption for ${name} has been approved and is ready for vet waiver processing.` })
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const data = await updateAdoptionStatus(
      req.params.id, 'Rejected',
      (name) => ({ title: 'Adoption request rejected', message: `Your adoption request for ${name} was rejected.` }),
      null
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ADOPTION')
      .update({ AdoptStatus: 'Cancelled' })
      .eq('AdoptID', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Adoption not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const data = await updateAdoptionStatus(
      req.params.id, 'Completed',
      (name) => ({ title: 'Adoption completed', message: `The adoption process for ${name} was completed.` }),
      null
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
