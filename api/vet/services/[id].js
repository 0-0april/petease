const { supabase } = require('../../_lib/supabase');
const { getUserWithRole } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, description, availabilityType, selectedDays, specificDate, notifyUsers } = req.body;
    try {
      const daysAvailable = (availabilityType !== 'specific' && selectedDays?.length) ? selectedDays : [];
      const endDate = (availabilityType === 'specific' && specificDate) ? specificDate : null;
      const { data, error } = await supabase.from('SERVICES').update({ ServType: name, ServDayAvailable: daysAvailable, ServEndDate: endDate }).eq('ServID', id).select().single();
      if (error) throw error;
      if (notifyUsers) {
        let availText = '';
        if (availabilityType === 'specific' && specificDate) {
          const d = new Date(specificDate + 'T00:00:00');
          availText = `${name} is now available on:\n- ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, ${d.toLocaleDateString('en-US', { weekday: 'long' })}`;
        } else if (selectedDays?.length) {
          availText = `${name} is now available on:\n${selectedDays.map(d => `- ${d}`).join('\n')}`;
        }
        await supabase.from('ANNOUNCEMENT').insert({ AnnounceTitle: `${name} has been updated!`, AnnounceContent: `${name} has been updated!\n\n${availText}`.trim(), AnnounceType: 'General', AnnouncedBy: null });
      }
      return res.json({ id: data.ServID, name: data.ServType, description, availabilityType, specificDate: data.ServEndDate, updatedAt: new Date().toISOString() });
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('SERVICES').delete().eq('ServID', id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
