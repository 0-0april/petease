import { supabase } from '../../../_lib/supabase.js';
import { getUserWithRole } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;
  const { attended, note } = req.body;

  try {
    const { data: logData, error: logError } = await supabase
      .from('APPOINTMENTLOGS')
      .insert({
        AppointID: id,
        LogAttendance: attended,
        LogStaffAssigned: user.accId,
        LogNote: note || (attended ? 'Patient attended appointment' : 'Patient did not show up'),
      })
      .select().single();

    if (logError) throw logError;

    const { data: appointment, error: appointError } = await supabase
      .from('APPOINTMENT').select('*').eq('AppointID', id).single();
    if (appointError) throw appointError;

    res.json({ success: true, appointment, log: logData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
