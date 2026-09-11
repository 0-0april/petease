const { supabase } = require('../../_lib/supabase');
const { getUser } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  const { id } = req.query;
  const { reason } = req.body;

  try {
    const { data: userData } = await supabase.from('USER').select('UserID').eq('AccID', user.accId).single();
    const { data: apt } = await supabase.from('APPOINTMENT')
      .select('AppointID, USERPETS!inner ( UserID )').eq('AppointID', id).eq('USERPETS.UserID', userData.UserID).single();
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });

    const payload = { AppointStatus: 'Cancelled' };
    if (reason) payload.CancellationReason = reason;

    const { data, error } = await supabase.from('APPOINTMENT').update(payload).eq('AppointID', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
