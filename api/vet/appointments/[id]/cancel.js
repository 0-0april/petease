const { supabase } = require('../../../_lib/supabase');
const { getUserWithRole } = require('../../../_lib/auth');
const { createNotification } = require('../../../_lib/notifications');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;
  const { reason } = req.body;
  try {
    const { data: details } = await supabase.from('APPOINTMENT').select('AppointSchedDate, USERPETS ( USER ( AccID ), PET ( PetName ) )').eq('AppointID', id).single();
    const { data, error } = await supabase.from('APPOINTMENT').update({ AppointStatus: 'Cancelled' }).eq('AppointID', id).select().single();
    if (error) throw error;

    await supabase.from('APPOINTMENTLOGS').insert({ AppointID: id, LogNote: reason || 'Cancelled by vet staff', LogStaffAssigned: user.accId });

    if (details?.USERPETS?.USER?.AccID) {
      await createNotification({
        accId: details.USERPETS.USER.AccID, title: 'Appointment cancelled',
        message: `Your appointment for ${details.USERPETS.PET?.PetName || 'your pet'} on ${details.AppointSchedDate?.split('T')[0] || 'the scheduled date'} was cancelled by vet staff.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'appointment',
      });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
