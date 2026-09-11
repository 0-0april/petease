import { supabase } from '../../../_lib/supabase.js';
import { getUserWithRole } from '../../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;

  try {
    const { data, error } = await supabase
      .from('APPOINTMENT').update({ AppointStatus: 'Confirmed' }).eq('AppointID', id).select().single();
    if (error) throw error;

    await supabase.from('APPOINTMENTLOGS').insert({
      AppointID: id, LogNote: 'Appointment confirmed by vet staff', LogStaffAssigned: user.accId,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
