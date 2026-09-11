import { supabase } from '../../_lib/supabase.js';
import { getUserWithRole } from '../../_lib/auth.js';

export default async function handler(req, res) {
  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;

  // PUT /api/vet/services/:id
  if (req.method === 'PUT') {
    const { name, description, availabilityType, selectedDays, specificDate, notifyUsers } = req.body;
    try {
      let daysAvailable = [];
      let endDate = null;
      if (availabilityType === 'specific' && specificDate) { endDate = specificDate; }
      else if (selectedDays?.length) { daysAvailable = selectedDays; }

      const { data, error } = await supabase
        .from('SERVICES')
        .update({ ServType: name, ServDayAvailable: daysAvailable, ServEndDate: endDate })
        .eq('ServID', id).select().single();
      if (error) throw error;

      if (notifyUsers) {
        let availabilityText = '';
        if (availabilityType === 'specific' && specificDate) {
          const d = new Date(specificDate + 'T00:00:00');
          const parts = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
          availabilityText = `${name} is now available on:\n- ${parts}, ${weekday}`;
        } else if (selectedDays?.length) {
          availabilityText = `${name} is now available on:\n${selectedDays.map(d => `- ${d}`).join('\n')}`;
        }
        await supabase.from('ANNOUNCEMENT').insert({
          AnnounceTitle: `${name} has been updated!`,
          AnnounceContent: `${name} has been updated!\n\n${availabilityText}`.trim(),
          AnnounceType: 'General', AnnouncedBy: null,
        });
      }

      return res.json({ id: data.ServID, name: data.ServType, description, availabilityType, specificDate: data.ServEndDate, updatedAt: new Date().toISOString() });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/vet/services/:id
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('SERVICES').delete().eq('ServID', id);
      if (error) throw error;
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
