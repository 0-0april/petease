import { supabase } from '../../_lib/supabase.js';
import { getUser } from '../../_lib/auth.js';
import multer from 'multer';

export const config = { api: { bodyParser: false } };

const upload = multer({ storage: multer.memoryStorage() });
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result))));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req, res);
  if (!user) return;

  const { id } = req.query;

  await runMiddleware(req, res, upload.single('waiver'));

  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('adoption-waivers')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('adoption-waivers').getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('ADOPTION')
      .update({ AdoptionWaiver: publicUrl })
      .eq('AdoptID', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Adoption not found' });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
