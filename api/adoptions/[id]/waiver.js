const { supabase } = require('../../_lib/supabase');
const { getUser } = require('../../_lib/auth');
const { parseMultipart } = require('../../_lib/parseMultipart');

module.exports.config = { api: { bodyParser: false } };

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  const { id } = req.query;
  try {
    const { files } = await parseMultipart(req);
    const file = files.waiver;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('adoption-waivers')
      .upload(fileName, file.buffer, { contentType: file.mimetype });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('adoption-waivers').getPublicUrl(fileName);
    const { data, error } = await supabase.from('ADOPTION').update({ AdoptionWaiver: publicUrl }).eq('AdoptID', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Adoption not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
