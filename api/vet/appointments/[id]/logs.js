import { supabase } from '../../../_lib/supabase.js';
import { getUserWithRole } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;

  try {
    const { data, error } = await supabase
      .from('APPOINTMENTLOGS')
      .select(`LogID, LogNote, LogAttendance, created_at, ACCOUNT ( AccUserName )`)
      .eq('AppointID', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(log => ({
      id: log.LogID,
      appointmentId: id,
      action: log.LogAttendance === true ? 'attended' : log.LogAttendance === false ? 'no-show' : 'updated',
      performedBy: log.ACCOUNT?.AccUserName || 'System',
      notes: log.LogNote || '',
      timestamp: log.created_at,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
