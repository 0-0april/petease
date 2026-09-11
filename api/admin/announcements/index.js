import { supabase } from '../../_lib/supabase.js';
import { getUserWithRole } from '../../_lib/auth.js';
import { createNotificationsForUsers, createNotificationsForVets } from '../../_lib/notifications.js';

export default async function handler(req, res) {
  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  // GET /api/admin/announcements
  if (req.method === 'GET') {
    try {
      const { data: adminAccs } = await supabase.from('ADMIN').select('AccID');
      const adminAccIds = (adminAccs || []).map(a => a.AccID);

      const { data, error } = await supabase
        .from('ANNOUNCEMENT')
        .select('*, ACCOUNT ( AccUserName )')
        .in('AnnouncedBy', adminAccIds.length ? adminAccIds : ['00000000-0000-0000-0000-000000000000'])
        .order('created_at', { ascending: false });
      if (error) throw error;

      return res.json((data || []).map(a => ({
        id: a.AnnounceID, title: a.AnnounceTitle, content: a.AnnounceContent,
        type: a.AnnounceType, createdAt: a.created_at, updatedAt: a.AnnounceDateUpdated,
        createdBy: a.ACCOUNT?.AccUserName || 'Admin',
      })));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /api/admin/announcements
  if (req.method === 'POST') {
    const { title, content, type } = req.body;
    try {
      const { data, error } = await supabase
        .from('ANNOUNCEMENT')
        .insert({ AnnounceTitle: title, AnnounceContent: content, AnnounceType: type || 'General', AnnouncedBy: user.accId })
        .select().single();
      if (error) throw error;

      await createNotificationsForUsers({ title: title || 'New announcement', message: content, type: 'announcement' });
      await createNotificationsForVets({ title: title || 'New system announcement', message: content, type: 'announcement' });

      return res.status(201).json({ id: data.AnnounceID, title: data.AnnounceTitle, content: data.AnnounceContent, type: data.AnnounceType, createdAt: data.created_at, updatedAt: data.AnnounceDateUpdated });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
