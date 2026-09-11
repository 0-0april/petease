const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');
const { parseMultipart } = require('../_lib/parseMultipart');

module.exports.config = { api: { bodyParser: false } };

async function uploadToSupabase(file, bucket, username) {
  const fileExt = file.originalname.split('.').pop();
  const originalName = file.originalname.replace(/\.[^/.]+$/, '');
  const fileName = `${username}_${originalName}.${fileExt}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
  if (error) throw error;
  return fileName;
}

async function getUsername(accId) {
  const { data } = await supabase.from('ACCOUNT').select('AccUserName').eq('AccID', accId).single();
  return data?.AccUserName || 'user';
}

async function getUserId(accId) {
  const { data } = await supabase.from('USER').select('UserID').eq('AccID', accId).single();
  return data?.UserID || null;
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: userpets, error } = await supabase.from('USERPETS').select(`
        UserID,
        PET ( PetID, PetName, PetBDay, PetSpecie, PetBreed, PetMarkings, PetGender, PetDetails, PetImg, PetAvailable, PetRegType, created_at ),
        USER ( UserID, UserName, ACCOUNT ( AccUserName ) )
      `).eq('PET.PetAvailable', true).eq('PET.PetRegType', 'Adoption');
      if (error) throw error;
      return res.json((userpets || []).filter(r => r.PET).map(r => ({
        ...r.PET, ownerId: r.UserID, owner_name: r.USER?.UserName || null, owner_username: r.USER?.ACCOUNT?.AccUserName || null,
      })));
    } catch (error) {
      return res.status(503).json({ error: 'Pets service temporarily unavailable', details: error.message });
    }
  }

  if (req.method === 'POST') {
    const user = getUser(req, res);
    if (!user) return;

    try {
      const { fields, files } = await parseMultipart(req);
      const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg, petRegType, vaccinationCard } = fields;

      const username = await getUsername(user.accId);
      let imageUrl = petImg || null;
      if (files.image) imageUrl = await uploadToSupabase(files.image, 'pet-images', username);

      const { data: pet, error: petError } = await supabase.from('PET').insert({
        PetName: petName, PetBDay: petBDay, PetSpecie: petSpecie, PetBreed: petBreed,
        PetMarkings: petMarkings, PetGender: petGender, PetDetails: petDetails,
        PetImg: imageUrl, PetRegType: petRegType, PetVaccinationCardFile: vaccinationCard || null,
      }).select().single();
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
};
