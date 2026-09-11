const { supabase } = require('../../../_lib/supabase');
const { getUserWithRole } = require('../../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;
  try {
    const { data, error } = await supabase.from('APPOINTMENTLOGS').select('LogID, LogNote, LogAttendance, created_at, ACCOUNT ( AccUserName )')
      .eq('AppointID', id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json((data || []).map(l => ({
      id: l.LogID, appointmentId: id,
      action: l.LogAttendance === true ? 'attended' : l.LogAttendance === false ? 'no-show' : 'updated',
      performedBy: l.ACCOUNT?.AccUserName || 'System', notes: l.LogNote || '', timestamp: l.created_at,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
