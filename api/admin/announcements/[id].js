import { supabase } from '../../_lib/supabase.js';
import { getUserWithRole } from '../../_lib/auth.js';
import { createNotificationsForUsers, createNotificationsForVets } from '../../_lib/notifications.js';

export default async function handler(req, res) {
  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  const { id } = req.query;

  // PUT /api/admin/announcements/:id — edit
  if (req.method === 'PUT') {
    const { title, content, type } = req.body;
    try {
      const { data, error } = await supabase
        .from('ANNOUNCEMENT')
        .update({ AnnounceTitle: title, AnnounceContent: content, AnnounceType: type || 'General', AnnounceDateUpdated: new Date().toISOString() })
        .eq('AnnounceID', id).select().single();
      if (error) throw error;
      return res.json({ id: data.AnnounceID, title: data.AnnounceTitle, content: data.AnnounceContent, type: data.AnnounceType, updatedAt: data.AnnounceDateUpdated });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/admin/announcements/:id
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('ANNOUNCEMENT').delete().eq('AnnounceID', id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
