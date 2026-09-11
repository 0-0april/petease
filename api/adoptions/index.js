import { supabase } from '../_lib/supabase.js';
import { getUser } from '../_lib/auth.js';
import { createNotification } from '../_lib/notifications.js';
import multer from 'multer';

export const config = { api: { bodyParser: false } };

const upload = multer({ storage: multer.memoryStorage() });
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result))));

const uploadToSupabase = async (file, bucket) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file.buffer, { contentType: file.mimetype });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrl;
};

const getUserInfo = async (accId) => {
  const { data } = await supabase.from('USER').select('UserID, UserName').eq('AccID', accId).single();
  return data || null;
};

export default async function handler(req, res) {
  // POST /api/adoptions — create adoption request
  if (req.method === 'POST') {
    const user = getUser(req, res);
    if (!user) return;

    await runMiddleware(req, res, upload.single('waiver'));

    const { userPetId } = req.body;

    try {
      const adopter = await getUserInfo(user.accId);
      if (!adopter) return res.status(404).json({ error: 'User not found' });

      const { data: userPetRow, error: upError } = await supabase
        .from('USERPETS')
        .select(`UserPetID, PET ( PetName ), USER ( AccID )`)
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

      return res.status(201).json(adoption);
    } catch (error) {
      console.error('Adoption creation error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
