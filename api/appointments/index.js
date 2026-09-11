const { supabase } = require('../_lib/supabase');
const { getUser } = require('../_lib/auth');
const { createNotificationsForVets } = require('../_lib/notifications');

const normalizeType = (s = '') => {
  const n = s.toLowerCase();
  if (n.includes('rabies')) return 'anti-rabies';
  if (n.includes('spay') || n.includes('neuter')) return 'spay';
  if (n.includes('consult')) return 'consultation';
  return n.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

module.exports = async function handler(req, res) {
  const user = getUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    try {
      const { data: userData } = await supabase.from('USER').select('UserID').eq('AccID', user.accId).single();
      if (!userData) return res.status(404).json({ error: 'User not found' });

      const { data, error } = await supabase.from('APPOINTMENT').select(`
        AppointID, AppointDateCreated, AppointSchedDate, AppointStatus,
        USERPETS!inner ( UserPetID, UserID, PET ( PetID, PetName, PetBreed ) ),
        SERVICES ( ServID, ServType )
      `).eq('USERPETS.UserID', userData.UserID).order('AppointDateCreated', { ascending: false });
      if (error) throw error;

      return res.json(data.map(apt => ({
        id: apt.AppointID, type: normalizeType(apt.SERVICES?.ServType), serviceType: apt.SERVICES?.ServType,
        date: apt.AppointSchedDate.split('T')[0], status: apt.AppointStatus.toLowerCase(),
        pets: [{ id: apt.USERPETS.PET.PetID, name: apt.USERPETS.PET.PetName, breed: apt.USERPETS.PET.PetBreed }],
        createdAt: apt.AppointDateCreated,
      })));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { petIds, serviceId, date } = req.body;
    try {
      const { data: userData } = await supabase.from('USER').select('UserID').eq('AccID', user.accId).single();
      if (!serviceId) throw new Error('serviceId is required');

      const appointments = [];
      for (const petId of petIds) {
        const { data: userPet, error: upErr } = await supabase.from('USERPETS').select('UserPetID')
          .eq('PetID', petId).eq('UserID', userData.UserID).single();
        if (upErr) throw upErr;

        const { data: appointment, error: aptErr } = await supabase.from('APPOINTMENT')
          .insert({ UserPetID: userPet.UserPetID, ServID: serviceId, AppointSchedDate: date, AppointStatus: 'Pending' })
          .select().single();
        if (aptErr) throw aptErr;
        appointments.push(appointment);
      }

      try {
        await createNotificationsForVets({
          title: 'New appointment booked',
          message: `A new appointment has been booked for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}.`,
          type: 'appointment',
        });
      } catch (e) { console.error('Vet notify error:', e); }

      return res.status(201).json(appointments[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
