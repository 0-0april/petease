import { supabase } from '../../../_lib/supabase.js';
import { getUserWithRole } from '../../../_lib/auth.js';
import { createNotification } from '../../../_lib/notifications.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;
  const { reason } = req.body;

  try {
    const { data: details } = await supabase
      .from('APPOINTMENT')
      .select(`AppointSchedDate, USERPETS ( USER ( AccID ), PET ( PetName ) )`)
      .eq('AppointID', id).single();

    const { data, error } = await supabase
      .from('APPOINTMENT').update({ AppointStatus: 'Cancelled' }).eq('AppointID', id).select().single();
    if (error) throw error;

    await supabase.from('APPOINTMENTLOGS').insert({
      AppointID: id, LogNote: reason || 'Cancelled by vet staff', LogStaffAssigned: user.accId,
    });

    if (details?.USERPETS?.USER?.AccID) {
      const petName = details.USERPETS.PET?.PetName || 'your pet';
      const date = details.AppointSchedDate?.split('T')[0] || 'the scheduled date';
      await createNotification({
        accId: details.USERPETS.USER.AccID,
        title: 'Appointment cancelled',
        message: `Your appointment for ${petName} on ${date} was cancelled by vet staff.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'appointment',
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
