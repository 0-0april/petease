const { supabase } = require('../../_lib/supabase');
const { getUserWithRole } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('SERVICES').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.json((data || []).map(s => ({ id: s.ServID, name: s.ServType, description: '', availabilityType: s.ServEndDate ? 'specific' : 'recurring', specificDate: s.ServEndDate || null, slots: s.ServSlot, status: s.ServStatus, daysAvailable: s.ServDayAvailable || [], createdAt: s.created_at })));
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }

  if (req.method === 'POST') {
    const { name, description, availabilityType, selectedDays, specificDate, notifyUsers } = req.body;
    try {
      const daysAvailable = (availabilityType !== 'specific' && selectedDays?.length) ? selectedDays : [];
      const endDate = (availabilityType === 'specific' && specificDate) ? specificDate : null;
      const { data, error } = await supabase.from('SERVICES').insert({ ServType: name, ServDayAvailable: daysAvailable, ServEndDate: endDate, ServSlot: 5, ServStatus: 'Active' }).select().single();
      if (error) throw error;
      if (notifyUsers) {
        await supabase.from('ANNOUNCEMENT').insert({ AnnounceTitle: `New Service: ${name}`, AnnounceContent: description ? `${name} is now available. ${description}` : `${name} is now available for booking.`, AnnounceType: 'General', AnnouncedBy: null });
      }
      return res.status(201).json({ id: data.ServID, name: data.ServType, description, availabilityType, specificDate: data.ServEndDate, createdAt: data.created_at });
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
