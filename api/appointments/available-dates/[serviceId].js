const { supabase } = require('../../_lib/supabase');
const { getUser } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = getUser(req, res);
  if (!user) return;

  const { serviceId } = req.query;
  try {
    const { data: service, error } = await supabase.from('SERVICES')
      .select('ServID, ServDayAvailable, ServEndDate').eq('ServID', serviceId).single();
    if (error || !service) return res.json([]);

    const availableDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (service.ServEndDate) {
      const specific = new Date(service.ServEndDate + 'T00:00:00');
      if (specific >= today) {
        const yyyy = specific.getFullYear();
        const mm = String(specific.getMonth() + 1).padStart(2, '0');
        const dd = String(specific.getDate()).padStart(2, '0');
        availableDates.push(`${yyyy}-${mm}-${dd}`);
      }
    } else if (service.ServDayAvailable?.length > 0) {
      const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
      for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (service.ServDayAvailable.includes(DAY_NAMES[d.getDay()])) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd2 = String(d.getDate()).padStart(2, '0');
          availableDates.push(`${yyyy}-${mm}-${dd2}`);
        }
      }
    }
    res.json(availableDates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
