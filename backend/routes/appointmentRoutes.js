import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Book appointment
router.post('/', authenticateToken, async (req, res) => {
  const { petIds, type, date } = req.body;
  
  try {
    console.log('📝 Book appointment request:', { petIds, type, date, accId: req.user.accId });
    
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

    const appointments = [];
    
    for (const petId of petIds) {
      console.log(`🐾 Processing pet: ${petId}`);
      
      // Get UserPetID
      const { data: userPet, error: userPetError } = await supabase
        .from('USERPETS')
        .select('UserPetID')
        .eq('PetID', petId)
        .eq('UserID', userData.UserID)
        .single();

      if (userPetError) {
        console.error('❌ Error fetching userPet:', userPetError);
        throw userPetError;
      }
      console.log('✅ Found userPet:', userPet);

      // Get ServID based on type
      console.log(`🔍 Looking for service with type: ${type}`);
      const { data: services, error: serviceError } = await supabase
        .from('SERVICES')
        .select('ServID, ServType')
        .ilike('ServType', `%${type}%`);

      if (serviceError) {
        console.error('❌ Error fetching service:', serviceError);
        throw serviceError;
      }
      
      console.log('🔍 Found services:', services);
      
      if (!services || services.length === 0) {
        throw new Error(`No service found matching type: ${type}. Please create services first.`);
      }
      
      const service = services[0];
      console.log('✅ Using service:', service);

      // Insert appointment
      const { data: appointment, error: appointError } = await supabase
        .from('APPOINTMENT')
        .insert({
          UserPetID: userPet.UserPetID,
          ServID: service.ServID,
          AppointSchedDate: date,
          AppointStatus: 'Pending'
        })
        .select()
        .single();

      if (appointError) {
        console.error('❌ Error creating appointment:', appointError);
        throw appointError;
      }
      console.log('✅ Created appointment:', appointment);
      appointments.push(appointment);
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
        USERPETS!APPOINTMENT_UserPetID_fkey (
          UserPetID,
          UserID,
          PET (
            PetID,
            PetName,
            PetBreed
          )
        ),
        SERVICES!APPOINTMENT_ServID_fkey (
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
      type: apt.SERVICES.ServType.toLowerCase().replace(/\s+/g, '-'),
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

// Get available dates for a service type
router.get('/available-dates/:type', authenticateToken, async (req, res) => {
  try {
    console.log('📅 Get available dates for type:', req.params.type);
    
    const { data: services, error } = await supabase
      .from('SERVICES')
      .select('ServID, ServType, ServDayAvailable, ServEndDate')
      .ilike('ServType', `%${req.params.type}%`);

    if (error) {
      console.error('❌ Error fetching service:', error);
      throw error;
    }
    
    console.log('🔍 Found services:', services);
    
    if (!services || services.length === 0) {
      console.log('⚠️ No services found, returning empty array');
      return res.json([]);
    }
    
    const data = services[0];
    console.log('✅ Using service:', data);

    // Generate available dates
    const availableDates = [];
    const today = new Date();
    const endDate = data.ServEndDate ? new Date(data.ServEndDate) : new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (data.ServDayAvailable && data.ServDayAvailable.includes(dayName)) {
        availableDates.push(d.toISOString().split('T')[0]);
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
