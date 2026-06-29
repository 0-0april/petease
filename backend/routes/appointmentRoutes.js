import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotificationsForVets } from '../utils/notificationHelper.js';

const router = express.Router();

const normalizeAppointmentType = (serviceType = '') => {
  const normalized = serviceType.toLowerCase();

  if (normalized.includes('rabies')) return 'anti-rabies';
  if (normalized.includes('spay') || normalized.includes('neuter')) return 'spay';
  if (normalized.includes('consult')) return 'consultation';

  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

// Book appointment
router.post('/', authenticateToken, async (req, res) => {
  const { petIds, serviceId, date } = req.body;
  
  try {
    console.log('📝 Book appointment request:', { petIds, serviceId, date, accId: req.user.accId });
    
    // Get UserID from the authenticated account
    const { data: userData, error: userError } = await supabase
      .from('USER')
      .select('UserID')
      .eq('AccID', req.user.accId)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      throw userError;
    }

    if (!serviceId) throw new Error('serviceId is required');

    const appointments = [];
    
    for (const petId of petIds) {
      // Get UserPetID
      const { data: userPet, error: userPetError } = await supabase
        .from('USERPETS')
        .select('UserPetID')
        .eq('PetID', petId)
        .eq('UserID', userData.UserID)
        .single();

      if (userPetError) throw userPetError;

      // Insert appointment using the exact ServID
      const { data: appointment, error: appointError } = await supabase
        .from('APPOINTMENT')
        .insert({
          UserPetID: userPet.UserPetID,
          ServID: serviceId,
          AppointSchedDate: date,
          AppointStatus: 'Pending'
        })
        .select()
        .single();

      if (appointError) throw appointError;
      appointments.push(appointment);
    }
    
    // Notify all vet staff about new appointment
    try {
      const petNames = petIds.join(', '); // fallback if we don't have names
      await createNotificationsForVets({
        title: 'New appointment booked',
        message: `A new appointment has been booked for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}.`,
        type: 'appointment'
      });
    } catch (notifErr) {
      console.error('Failed to notify vets:', notifErr);
    }

    res.status(201).json(appointments[0]);
  } catch (error) {
    console.error('❌ Book appointment error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

// Get user's appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Get appointments request for accId:', req.user.accId);
    
    // Get UserID from the authenticated account
    const { data: userData, error: userError } = await supabase
      .from('USER')
      .select('UserID')
      .eq('AccID', req.user.accId)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      throw userError;
    }
    console.log('✅ Found user:', userData);

    // Get appointments by joining through USERPETS
    const { data, error } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointID,
        AppointDateCreated,
        AppointSchedDate,
        AppointStatus,
        USERPETS!inner (
          UserPetID,
          UserID,
          PET (
            PetID,
            PetName,
            PetBreed
          )
        ),
        SERVICES (
          ServID,
          ServType
        )
      `)
      .eq('USERPETS.UserID', userData.UserID)
      .order('AppointDateCreated', { ascending: false });

    if (error) {
      console.error('❌ Error fetching appointments:', error);
      throw error;
    }
    console.log('✅ Found appointments:', data?.length || 0);

    // Transform data
    const appointments = data.map(apt => ({
      id: apt.AppointID,
      type: normalizeAppointmentType(apt.SERVICES?.ServType),
      date: apt.AppointSchedDate.split('T')[0],
      status: apt.AppointStatus.toLowerCase(),
      pets: [{
        id: apt.USERPETS.PET.PetID,
        name: apt.USERPETS.PET.PetName,
        breed: apt.USERPETS.PET.PetBreed
      }],
      createdAt: apt.AppointDateCreated
    }));
    
    res.json(appointments);
  } catch (error) {
    console.error('❌ Get appointments error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

// Cancel appointment
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('USER')
      .select('UserID')
      .eq('AccID', req.user.accId)
      .single();

    if (userError) throw userError;

    const { data: appointment, error: appointmentError } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointID,
        USERPETS!inner (
          UserID
        )
      `)
      .eq('AppointID', req.params.id)
      .eq('USERPETS.UserID', userData.UserID)
      .single();

    if (appointmentError || !appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { data, error } = await supabase
      .from('APPOINTMENT')
      .update({ AppointStatus: 'Cancelled' })
      .eq('AppointID', req.params.id)
      .select()
      .single();

    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all active services (for user booking step 2)
router.get('/services', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('SERVICES')
      .select('ServID, ServType, ServDayAvailable, ServEndDate, ServSlot, ServStatus')
      .eq('ServStatus', 'Active')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const services = (data || []).map(s => ({
      id: s.ServID,
      name: s.ServType,
      daysAvailable: s.ServDayAvailable || [],
      specificDate: s.ServEndDate || null,
      slots: s.ServSlot,
      status: s.ServStatus,
    }));

    res.json(services);
  } catch (error) {
    console.error('❌ Get services error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available dates for a service by ID
router.get('/available-dates/:serviceId', authenticateToken, async (req, res) => {
  try {
    console.log('📅 Get available dates for serviceId:', req.params.serviceId);
    
    const { data: service, error } = await supabase
      .from('SERVICES')
      .select('ServID, ServType, ServDayAvailable, ServEndDate')
      .eq('ServID', req.params.serviceId)
      .single();

    if (error) {
      console.error('❌ Error fetching service:', error);
      return res.json([]);
    }

    if (!service) {
      return res.json([]);
    }

    console.log('✅ Using service:', service);

    // Generate available dates using local date formatting to avoid UTC timezone shift
    const availableDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = service.ServEndDate ? new Date(service.ServEndDate) : new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (service.ServDayAvailable && service.ServDayAvailable.includes(dayName)) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        availableDates.push(`${yyyy}-${mm}-${dd}`);
      }
    }

    console.log('✅ Generated available dates:', availableDates.length);
    res.json(availableDates);
  } catch (error) {
    console.error('❌ Get available dates error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

export default router;
