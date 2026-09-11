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

module.exports = async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data: userpets, error } = await supabase.from('USERPETS').select(`
        UserID,
        PET ( PetID, PetName, PetBDay, PetSpecie, PetBreed, PetMarkings, PetGender, PetDetails, PetImg, PetAvailable, PetRegType ),
        USER ( UserID, UserName, ACCOUNT ( AccUserName ) )
      `).eq('PET.PetID', id).single();
      if (error || !userpets?.PET) return res.status(404).json({ error: 'Pet not found' });
      return res.json({ ...userpets.PET, ownerId: userpets.UserID, owner_name: userpets.USER?.UserName || null, owner_username: userpets.USER?.ACCOUNT?.AccUserName || null });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    const user = getUser(req, res);
    if (!user) return;

    try {
      const { fields, files } = await parseMultipart(req);
      const { petName, petBDay, petSpecie, petBreed, petMarkings, petGender, petDetails, petImg, vaccinationCard } = fields;

      const username = await getUsername(user.accId);
      let imageUrl = petImg || null;
      if (files.image) imageUrl = await uploadToSupabase(files.image, 'pet-images', username);

      const updatePayload = { PetName: petName, PetBDay: petBDay, PetSpecie: petSpecie, PetBreed: petBreed, PetMarkings: petMarkings, PetGender: petGender, PetDetails: petDetails, PetImg: imageUrl };
      if (vaccinationCard !== undefined) updatePayload.PetVaccinationCardFile = vaccinationCard || null;

      const { data: pet, error } = await supabase.from('PET').update(updatePayload).eq('PetID', id).select().single();
      if (error) throw error;
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      return res.json(pet);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const user = getUser(req, res);
    if (!user) return;

    try {
      await supabase.from('USERPETS').delete().eq('PetID', id);
      await supabase.from('PET').delete().eq('PetID', id);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
