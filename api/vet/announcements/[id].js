import { supabase } from '../../_lib/supabase.js';
import { getUserWithRole } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;
  const { title, content, serviceType } = req.body;

  try {
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .update({
        AnnounceTitle: title, AnnounceContent: content,
        AnnounceType: serviceType || 'General', AnnouncedBy: null,
        AnnounceDateUpdated: new Date().toISOString(),
      })
      .eq('AnnounceID', id).select().single();

    if (error) throw error;

    res.json({ id: data.AnnounceID, title: data.AnnounceTitle, content: data.AnnounceContent, type: data.AnnounceType, createdAt: data.created_at, status: 'pending' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
