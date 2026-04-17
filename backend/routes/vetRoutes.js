import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all appointments for vet
router.get('/appointments', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    console.log('🏥 Vet get appointments request');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Get appointments with count
    const { data, error, count } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointID,
        AppointDateCreated,
        AppointSchedDate,
        AppointStatus,
        USERPETS!APPOINTMENT_UserPetID_fkey (
          UserPetID,
          USER (
            UserID,
            UserName,
            ACCOUNT (
              AccPhoneNum
            )
          ),
          PET (
            PetID,
            PetName,
            PetBreed
          )
        ),
        SERVICES!APPOINTMENT_ServID_fkey (
          ServID,
          ServType
        ),
        APPOINTMENTLOGS (
          LogID,
          LogAttendance,
          created_at
        )
      `, { count: 'exact' })
      .order('AppointDateCreated', { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    if (error) {
      console.error('❌ Error fetching vet appointments:', error);
      throw error;
    }
    console.log('✅ Found appointments:', data?.length || 0);

    // Transform data
    const appointments = data.map(apt => {
      const schedDate = new Date(apt.AppointSchedDate);
      
      // Find the most recent attendance log (where LogAttendance is true)
      const attendanceLogs = apt.APPOINTMENTLOGS || [];
      const attendedLog = attendanceLogs.find(log => log.LogAttendance === true);
      
      console.log(`📋 Appointment ${apt.AppointID}: status=${apt.AppointStatus}, logs=${attendanceLogs.length}, attended=${!!attendedLog}`);
      
      return {
        id: apt.AppointID,
        userId: apt.USERPETS.USER.UserID,
        userName: apt.USERPETS.USER.UserName,
        userPhone: apt.USERPETS.USER.ACCOUNT.AccPhoneNum || 'N/A',
        date: schedDate.toISOString().split('T')[0],
        type: apt.SERVICES.ServType.toLowerCase().replace(/\s+/g, '-'),
        status: apt.AppointStatus.toLowerCase(),
        pets: [{
          id: apt.USERPETS.PET.PetID,
          name: apt.USERPETS.PET.PetName,
          breed: apt.USERPETS.PET.PetBreed
        }],
        attended: attendedLog ? true : (attendanceLogs.length > 0 ? false : null),
        createdAt: apt.AppointDateCreated,
        notes: ''
      };
    });

    res.json({
      appointments,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('❌ Get vet appointments error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

// Get single appointment by ID
router.get('/appointments/:id', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointID,
        AppointDateCreated,
        AppointSchedDate,
        AppointStatus,
        ServID,
        USERPETS!APPOINTMENT_UserPetID_fkey (
          UserPetID,
          USER (
            UserID,
            UserName,
            UserAddress,
            ACCOUNT (
              AccPhoneNum
            )
          ),
          PET (
            PetID,
            PetName,
            PetBreed,
            PetSpecie,
            PetGender,
            PetMarkings,
            PetBDay
          )
        ),
        SERVICES!APPOINTMENT_ServID_fkey (
          ServID,
          ServType
        )
      `)
      .eq('AppointID', req.params.id)
      .single();

    if (error) throw error;

    // Calculate pet age from birthday
    const calculateAge = (birthday) => {
      if (!birthday) return null;
      const today = new Date();
      const birthDate = new Date(birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 0 ? `${age} years` : 'Less than 1 year';
    };

    // Get medical records for this service
    const { data: medicalRecords } = await supabase
      .from('MEDICALHISTORY')
      .select('MedID, Medicine, Description, created_at')
      .eq('ServID', data.ServID)
      .order('created_at', { ascending: false });

    const schedDate = new Date(data.AppointSchedDate);
    const appointment = {
      id: data.AppointID,
      userId: data.USERPETS.USER.UserID,
      userName: data.USERPETS.USER.UserName,
      userPhone: data.USERPETS.USER.ACCOUNT.AccPhoneNum || 'N/A',
      userAddress: data.USERPETS.USER.UserAddress || 'N/A',
      date: schedDate.toISOString().split('T')[0],
      type: data.SERVICES.ServType.toLowerCase().replace(/\s+/g, '-'),
      status: data.AppointStatus.toLowerCase(),
      pets: [{
        id: data.USERPETS.PET.PetID,
        name: data.USERPETS.PET.PetName,
        breed: data.USERPETS.PET.PetBreed,
        species: data.USERPETS.PET.PetSpecie,
        gender: data.USERPETS.PET.PetGender,
        markings: data.USERPETS.PET.PetMarkings,
        age: calculateAge(data.USERPETS.PET.PetBDay)
      }],
      medicalRecords: medicalRecords?.map(record => ({
        id: record.MedID,
        medicine: record.Medicine,
        description: record.Description,
        date: record.created_at
      })) || [],
      createdAt: data.AppointDateCreated
    };

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm appointment
router.patch('/appointments/:id/confirm', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('APPOINTMENT')
      .update({ AppointStatus: 'Confirmed' })
      .eq('AppointID', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Add log entry
    const { error: logError } = await supabase
      .from('APPOINTMENTLOGS')
      .insert({
        AppointID: req.params.id,
        LogNote: 'Appointment confirmed by vet staff',
        LogStaffAssigned: req.user.accId
      });

    if (logError) console.error('Error creating log:', logError);

    res.json(data);
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel appointment
router.patch('/appointments/:id/cancel', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { reason } = req.body;

    const { data, error } = await supabase
      .from('APPOINTMENT')
      .update({ AppointStatus: 'Cancelled' })
      .eq('AppointID', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Add log entry
    const { error: logError } = await supabase
      .from('APPOINTMENTLOGS')
      .insert({
        AppointID: req.params.id,
        LogNote: reason || 'Cancelled by vet staff',
        LogStaffAssigned: req.user.accId
      });

    if (logError) console.error('Error creating log:', logError);

    res.json(data);
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark attendance
router.patch('/appointments/:id/attendance', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { attended, note } = req.body;

    console.log('📋 Marking attendance:', { appointmentId: req.params.id, attended, staffId: req.user.accId });

    // Insert into APPOINTMENTLOGS table (requirement 22)
    const { data: logData, error: logError } = await supabase
      .from('APPOINTMENTLOGS')
      .insert({
        AppointID: req.params.id,
        LogAttendance: attended,
        LogStaffAssigned: req.user.accId,
        LogNote: note || (attended ? 'Patient attended appointment' : 'Patient did not show up')
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Error creating attendance log:', logError);
      throw logError;
    }

    console.log('✅ Attendance log created:', logData);

    // Return the appointment data (status remains unchanged)
    const { data: appointment, error: appointError } = await supabase
      .from('APPOINTMENT')
      .select('*')
      .eq('AppointID', req.params.id)
      .single();

    if (appointError) throw appointError;

    res.json({ success: true, appointment, log: logData });
  } catch (error) {
    console.error('❌ Mark attendance error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get appointment logs
router.get('/appointments/:id/logs', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('APPOINTMENTLOGS')
      .select(`
        LogID,
        LogNote,
        LogAttendance,
        created_at,
        ACCOUNT (
          AccUserName
        )
      `)
      .eq('AppointID', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const logs = data.map(log => ({
      id: log.LogID,
      appointmentId: req.params.id,
      action: log.LogAttendance === true ? 'attended' : log.LogAttendance === false ? 'no-show' : 'updated',
      performedBy: log.ACCOUNT?.AccUserName || 'System',
      notes: log.LogNote || '',
      timestamp: log.created_at
    }));

    res.json(logs);
  } catch (error) {
    console.error('Get appointment logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get services
router.get('/services', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('SERVICES')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match UI expectations
    const services = data.map(service => ({
      id: service.ServID,
      name: service.ServType,
      description: `Available on: ${service.ServDayAvailable?.join(', ') || 'Not set'}`,
      availabilityType: service.ServEndDate ? 'specific' : 'recurring',
      specificDate: service.ServEndDate,
      slots: service.ServSlot,
      status: service.ServStatus,
      daysAvailable: service.ServDayAvailable,
      createdAt: service.created_at
    }));

    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create service
router.post('/services', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    console.log('📝 Create service:', req.body);
    
    const { name, description, availabilityType, specificDate, notifyUsers } = req.body;

    // Determine days available based on availability type
    let daysAvailable = [];
    let endDate = null;

    if (availabilityType === 'recurring') {
      // Default to weekdays for recurring services
      daysAvailable = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    } else if (availabilityType === 'specific' && specificDate) {
      // For specific date, set end date
      endDate = specificDate;
      // Get the day of week for the specific date
      const date = new Date(specificDate);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      daysAvailable = [dayName];
    }

    const { data, error } = await supabase
      .from('SERVICES')
      .insert({
        ServType: name,
        ServDayAvailable: daysAvailable,
        ServEndDate: endDate,
        ServSlot: 5, // Default slot count
        ServStatus: 'Active'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating service:', error);
      throw error;
    }

    console.log('✅ Service created:', data);
    res.status(201).json({
      id: data.ServID,
      name: data.ServType,
      description,
      availabilityType,
      specificDate: data.ServEndDate,
      createdAt: data.created_at
    });
  } catch (error) {
    console.error('❌ Create service error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

// Update service
router.put('/services/:id', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    console.log('✏️ Update service:', req.params.id, req.body);
    
    const { name, description, availabilityType, specificDate, notifyUsers } = req.body;

    // Determine days available based on availability type
    let daysAvailable = [];
    let endDate = null;

    if (availabilityType === 'recurring') {
      daysAvailable = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    } else if (availabilityType === 'specific' && specificDate) {
      endDate = specificDate;
      const date = new Date(specificDate);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      daysAvailable = [dayName];
    }

    const { data, error } = await supabase
      .from('SERVICES')
      .update({
        ServType: name,
        ServDayAvailable: daysAvailable,
        ServEndDate: endDate
      })
      .eq('ServID', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating service:', error);
      throw error;
    }

    // TODO: If notifyUsers is true, send notifications to all users
    if (notifyUsers) {
      console.log('📢 Would notify users about service update:', name);
      // Implement notification logic here
    }

    console.log('✅ Service updated:', data);
    res.json({
      id: data.ServID,
      name: data.ServType,
      description,
      availabilityType,
      specificDate: data.ServEndDate,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Update service error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

// Delete service
router.delete('/services/:id', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    console.log('🗑️ Delete service:', req.params.id);
    
    const { error } = await supabase
      .from('SERVICES')
      .delete()
      .eq('ServID', req.params.id);

    if (error) {
      console.error('❌ Error deleting service:', error);
      throw error;
    }

    console.log('✅ Service deleted');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete service error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

// Get all approved adoptions for vet processing
router.get('/adoptions', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    console.log('🐾 Get approved adoptions for vet');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Get approved and completed adoptions with related data
    const { data, error, count } = await supabase
      .from('ADOPTION')
      .select(`
        AdoptID,
        AdoptReqDate,
        AdoptStatus,
        AdoptionWaiver,
        created_at,
        USER!ADOPTION_UserID_fkey (
          UserID,
          UserName,
          ACCOUNT (
            AccEmail,
            AccPhoneNum
          )
        ),
        USERPETS!ADOPTION_UserPetsID_fkey (
          UserPetID,
          PET (
            PetID,
            PetName,
            PetBreed,
            PetImg
          )
        )
      `, { count: 'exact' })
      .in('AdoptStatus', ['Approved', 'Completed'])
      .order('AdoptReqDate', { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    if (error) {
      console.error('❌ Error fetching adoptions:', error);
      throw error;
    }
    console.log('✅ Found adoptions:', data?.length || 0);

    // Transform data to match UI expectations
    const adoptions = data.map(adoption => ({
      id: adoption.AdoptID,
      petId: adoption.USERPETS.PET.PetID,
      petName: adoption.USERPETS.PET.PetName,
      petBreed: adoption.USERPETS.PET.PetBreed,
      petImage: adoption.USERPETS.PET.PetImg,
      adopterName: adoption.USER.UserName,
      adopterEmail: adoption.USER.ACCOUNT.AccEmail,
      adopterPhone: adoption.USER.ACCOUNT.AccPhoneNum || 'N/A',
      status: adoption.AdoptStatus.toLowerCase(),
      createdAt: adoption.AdoptReqDate,
      waiverDocument: adoption.AdoptionWaiver,
      message: '', // Not stored in current schema
      completedAt: adoption.AdoptStatus === 'Completed' ? adoption.created_at : null
    }));

    res.json({
      adoptions,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('❌ Get vet adoptions error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

// Complete adoption
router.post('/adoptions/:id/complete', authenticateToken, authorizeRole('vet'), upload.single('waiver'), async (req, res) => {
  try {
    console.log('✅ Complete adoption:', req.params.id);
    
    const { service, notes, petId } = req.body;
    let waiverUrl = null;

    // Upload waiver file to Supabase storage
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      console.log('📤 Uploading waiver to storage:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('adoption-waivers')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Error uploading waiver:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('adoption-waivers')
        .getPublicUrl(fileName);

      waiverUrl = publicUrl;
      console.log('✅ Waiver uploaded:', waiverUrl);
    }

    // Update adoption status to Completed
    const { data: adoption, error: adoptError } = await supabase
      .from('ADOPTION')
      .update({ 
        AdoptStatus: 'Completed',
        AdoptionWaiver: waiverUrl || 'Completed by vet staff'
      })
      .eq('AdoptID', req.params.id)
      .select(`
        AdoptID,
        USERPETS!ADOPTION_UserPetsID_fkey (
          PET (
            PetID
          )
        )
      `)
      .single();

    if (adoptError) {
      console.error('❌ Error updating adoption:', adoptError);
      throw adoptError;
    }

    // If service and notes provided, create medical history record
    if (service || notes) {
      const { error: medError } = await supabase
        .from('MEDICALHISTORY')
        .insert({
          Medicine: service || 'Adoption Processing',
          Description: notes || 'Adoption completed and processed by vet staff'
        });

      if (medError) {
        console.error('⚠️ Error creating medical record:', medError);
        // Don't fail the whole operation if medical record fails
      }
    }

    // Mark pet as unavailable
    const petIdToUpdate = petId || adoption.USERPETS.PET.PetID;
    const { error: petError } = await supabase
      .from('PET')
      .update({ PetAvailable: false })
      .eq('PetID', petIdToUpdate);

    if (petError) {
      console.error('⚠️ Error updating pet availability:', petError);
    }

    console.log('✅ Adoption completed successfully');
    res.json({ success: true, adoption, waiverUrl });
  } catch (error) {
    console.error('❌ Complete adoption error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

export default router;
