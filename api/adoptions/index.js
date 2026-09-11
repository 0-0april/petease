const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');
const { createNotification } = require('../_lib/notifications');
const { parseMultipart } = require('../_lib/parseMultipart');

module.exports.config = { api: { bodyParser: false } };

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  try {
    const { fields, files } = await parseMultipart(req);
    const { userPetId } = fields;

    const { data: adopter } = await supabase.from('USER').select('UserID, UserName').eq('AccID', user.accId).single();
    if (!adopter) return res.status(404).json({ error: 'User not found' });

    const { data: userPetRow, error: upError } = await supabase.from('USERPETS')
      .select('UserPetID, PET ( PetName ), USER ( AccID )').eq('PetID', userPetId).single();
    if (upError || !userPetRow) return res.status(404).json({ error: 'Pet not found in USERPETS table' });

    let waiverUrl = null;
    if (files.waiver) {
      const file = files.waiver;
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('adoption-waivers')
        .upload(fileName, file.buffer, { contentType: file.mimetype });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('adoption-waivers').getPublicUrl(fileName);
      waiverUrl = publicUrl;
    }

    const { data: adoption, error: adoptError } = await supabase.from('ADOPTION')
      .insert({ UserID: adopter.UserID, UserPetsID: userPetRow.UserPetID, AdoptionWaiver: waiverUrl })
      .select().single();
    if (adoptError) throw adoptError;

    await createNotification({
      accId: userPetRow.USER?.AccID, title: 'New adoption request',
      message: `${adopter.UserName} requested to adopt ${userPetRow.PET?.PetName}.`, type: 'adoption',
    });

    res.status(201).json(adoption);
  } catch (error) {
    console.error('Adoption creation error:', error);
    res.status(500).json({ error: error.message });
  }
};
