import { supabase } from '../_lib/supabase.js';
import { getUser } from '../_lib/auth.js';
import { createNotificationsForVets } from '../_lib/notifications.js';

const normalizeAppointmentType = (serviceType = '') => {
  const normalized = serviceType.toLowerCase();
  if (normalized.includes('rabies')) return 'anti-rabies';
  if (normalized.includes('spay') || normalized.includes('neuter')) return 'spay';
  if (normalized.includes('consult')) return 'consultation';
  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

export default async function handler(req, res) {
  const user = getUser(req, res);
  if (!user) return;

  // GET /api/appointments — get user's appointments
  if (req.method === 'GET') {
    try {
      const { data: userData, error: userError } = await supabase
        .from('USER').select('UserID').eq('AccID', user.accId).single();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('APPOINTMENT')
        .select(`
          AppointID, AppointDateCreated, AppointSchedDate, AppointStatus,
          USERPETS!inner ( UserPetID, UserID, PET ( PetID, PetName, PetBreed ) ),
          SERVICES ( ServID, ServType )
        `)
        .eq('USERPETS.UserID', userData.UserID)
        .order('AppointDateCreated', { ascending: false });

      if (error) throw error;

      return res.json(data.map(apt => ({
        id: apt.AppointID,
        type: normalizeAppointmentType(apt.SERVICES?.ServType),
        serviceType: apt.SERVICES?.ServType,
        date: apt.AppointSchedDate.split('T')[0],
        status: apt.AppointStatus.toLowerCase(),
        pets: [{ id: apt.USERPETS.PET.PetID, name: apt.USERPETS.PET.PetName, breed: apt.USERPETS.PET.PetBreed }],
        createdAt: apt.AppointDateCreated,
      })));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /api/appointments — book appointment
  if (req.method === 'POST') {
    const { petIds, serviceId, date } = req.body;

    try {
      const { data: userData, error: userError } = await supabase
        .from('USER').select('UserID').eq('AccID', user.accId).single();
      if (userError) throw userError;
      if (!serviceId) throw new Error('serviceId is required');

      const appointments = [];

      for (const petId of petIds) {
        const { data: userPet, error: userPetError } = await supabase
          .from('USERPETS').select('UserPetID')
          .eq('PetID', petId).eq('UserID', userData.UserID).single();
        if (userPetError) throw userPetError;

        const { data: appointment, error: appointError } = await supabase
          .from('APPOINTMENT')
          .insert({ UserPetID: userPet.UserPetID, ServID: serviceId, AppointSchedDate: date, AppointStatus: 'Pending' })
          .select().single();
        if (appointError) throw appointError;

        appointments.push(appointment);
      }

      try {
        await createNotificationsForVets({
          title: 'New appointment booked',
          message: `A new appointment has been booked for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}.`,
          type: 'appointment',
        });
      } catch (notifErr) {
        console.error('Failed to notify vets:', notifErr);
      }

      return res.status(201).json(appointments[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
