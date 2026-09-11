import { supabase } from '../../_lib/supabase.js';
import { getUserWithRole } from '../../_lib/auth.js';
import { createNotificationsForUsers } from '../../_lib/notifications.js';

export default async function handler(req, res) {
  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  // GET /api/vet/announcements
  if (req.method === 'GET') {
    try {
      const { data: staffRow } = await supabase.from('VETSTAFF').select('StaffID, StaffName').eq('AccID', user.accId).single();
      const { data, error } = await supabase
        .from('ANNOUNCEMENT')
        .select('AnnounceID, AnnounceTitle, AnnounceContent, AnnounceType, AnnounceDateUpdated, created_at, AnnouncedBy')
        .order('created_at', { ascending: false });
      if (error) throw error;

      return res.json((data || []).map(a => ({
        id: a.AnnounceID, title: a.AnnounceTitle, content: a.AnnounceContent,
        type: a.AnnounceType, createdAt: a.created_at, updatedAt: a.AnnounceDateUpdated,
        status: a.AnnouncedBy ? 'approved' : 'pending',
        createdBy: staffRow?.StaffName || 'Vet Staff',
      })));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /api/vet/announcements
  if (req.method === 'POST') {
    const { title, content, serviceType } = req.body;
    try {
      const { data: staffRow } = await supabase.from('VETSTAFF').select('StaffID, StaffName').eq('AccID', user.accId).single();
      const { data, error } = await supabase
        .from('ANNOUNCEMENT')
        .insert({ AnnounceTitle: title, AnnounceContent: content, AnnounceType: serviceType || 'General', AnnouncedBy: null })
        .select().single();
      if (error) throw error;

      await createNotificationsForUsers({ title: `New announcement: ${title}`, message: content, type: 'announcement' });

      return res.status(201).json({
        id: data.AnnounceID, title: data.AnnounceTitle, content: data.AnnounceContent,
        type: data.AnnounceType, createdAt: data.created_at, status: 'pending',
        createdBy: staffRow?.StaffName || 'Vet Staff',
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
