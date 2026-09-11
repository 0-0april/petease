const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');
const { parseMultipart } = require('../_lib/parseMultipart');

module.exports.config = { api: { bodyParser: false } };

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  try {
    const { files } = await parseMultipart(req);
    const file = files.vaccinationCard;

    if (!file) return res.status(400).json({ error: 'No file provided' });
    if (file.buffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'File must be under 5 MB' });

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('pet-vaccinationcard')
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('pet-vaccinationcard').getPublicUrl(fileName);
    res.json({ url: publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
