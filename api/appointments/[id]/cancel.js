import { supabase } from '../../_lib/supabase.js';
import { getUser } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req, res);
  if (!user) return;

  const { id } = req.query;
  const { reason } = req.body;

  try {
    const { data: userData, error: userError } = await supabase
      .from('USER').select('UserID').eq('AccID', user.accId).single();
    if (userError) throw userError;

    const { data: appointment, error: appointmentError } = await supabase
      .from('APPOINTMENT')
      .select(`AppointID, USERPETS!inner ( UserID )`)
      .eq('AppointID', id)
      .eq('USERPETS.UserID', userData.UserID)
      .single();

    if (appointmentError || !appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updatePayload = { AppointStatus: 'Cancelled' };
    if (reason) updatePayload.CancellationReason = reason;

    const { data, error } = await supabase
      .from('APPOINTMENT').update(updatePayload).eq('AppointID', id).select().single();
    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
