import { supabase } from '../_lib/supabase.js';
import { getUser } from '../_lib/auth.js';
import multer from 'multer';

export const config = { api: { bodyParser: false } };

const upload = multer({ storage: multer.memoryStorage() });
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result))));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req, res);
  if (!user) return;

  await runMiddleware(req, res, upload.single('vaccinationCard'));

  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    if (req.file.size > 5 * 1024 * 1024) return res.status(400).json({ error: 'File must be under 5 MB' });

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('pet-vaccinationcard')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('pet-vaccinationcard').getPublicUrl(fileName);

    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Vaccination card upload error:', error);
    res.status(500).json({ error: error.message });
  }
}
