import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { createNotification, createNotificationsForVets, createNotificationsForUsers } from '../utils/notificationHelper.js';

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

    const { data: appointmentDetails } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointSchedDate,
        USERPETS (
          USER (
            AccID
          ),
          PET (
            PetName
          )
        )
      `)
      .eq('AppointID', req.params.id)
      .single();

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

    if (appointmentDetails?.USERPETS?.USER?.AccID) {
      const petName = appointmentDetails.USERPETS.PET?.PetName || 'your pet';
      const date = appointmentDetails.AppointSchedDate?.split('T')[0] || 'the scheduled date';

      await createNotification({
        accId: appointmentDetails.USERPETS.USER.AccID,
        title: 'Appointment cancelled',
        message: `Your appointment for ${petName} on ${date} was cancelled by vet staff.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'appointment'
      });
    }

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
      description: '',   // SERVICES table has no description column
      availabilityType: service.ServEndDate ? 'specific' : 'recurring',
      specificDate: service.ServEndDate || null,
      slots: service.ServSlot,
      status: service.ServStatus,
      daysAvailable: service.ServDayAvailable || [],
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
    
    const { name, description, availabilityType, selectedDays, specificDate, notifyUsers } = req.body;

    // Build availability from new UI fields
    let daysAvailable = [];
    let endDate = null;

    if (availabilityType === 'specific' && specificDate) {
      endDate = specificDate;
      daysAvailable = [];
    } else if (selectedDays && selectedDays.length > 0) {
      daysAvailable = selectedDays;
    }

    const { data, error } = await supabase
      .from('SERVICES')
      .insert({
        ServType: name,
        ServDayAvailable: daysAvailable,
        ServEndDate: endDate,
        ServSlot: 5,
        ServStatus: 'Active'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating service:', error);
      throw error;
    }

    console.log('✅ Service created:', data);
    if (notifyUsers) {
      // Create a pending announcement (AnnouncedBy = null = awaiting admin approval)
      await supabase
        .from('ANNOUNCEMENT')
        .insert({
          AnnounceTitle: `New Service: ${name}`,
          AnnounceContent: description
            ? `${name} is now available. ${description}`
            : `${name} is now available for booking.`,
          AnnounceType: 'General',
          AnnouncedBy: null,  // pending admin review
        });
    }

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
    
    const { name, description, availabilityType, selectedDays, specificDate, notifyUsers } = req.body;

    // Build availability from new UI fields
    let daysAvailable = [];
    let endDate = null;

    if (availabilityType === 'specific' && specificDate) {
      endDate = specificDate;
      daysAvailable = [];
    } else if (selectedDays && selectedDays.length > 0) {
      daysAvailable = selectedDays;
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
    if (notifyUsers) {
      // Build human-readable announcement content reflecting the actual changes
      let availabilityText = '';
      if (availabilityType === 'specific' && specificDate) {
        // Format: "July 17, 2026, Friday"
        const dateObj = new Date(specificDate + 'T00:00:00');
        const formatted = dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          weekday: 'long',
        });
        // Reorder to "Month Day, Year, Weekday"
        const parts = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        availabilityText = `${name} is now available on:\n- ${parts}, ${weekday}`;
      } else if (selectedDays && selectedDays.length > 0) {
        const dayList = selectedDays.map(d => `- ${d}`).join('\n');
        availabilityText = `${name} is now available on:\n${dayList}`;
      }

      const announceContent = `${name} has been updated!\n\n${availabilityText}`.trim();

      await supabase
        .from('ANNOUNCEMENT')
        .insert({
          AnnounceTitle: `${name} has been updated!`,
          AnnounceContent: announceContent,
          AnnounceType: 'General',
          AnnouncedBy: null,  // pending admin review
        });
    }

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
    const { data: adopter } = await supabase
      .from('ADOPTION')
      .select(`
        USER (
          AccID
        ),
        USERPETS (
          PET (
            PetName
          )
        )
      `)
      .eq('AdoptID', req.params.id)
      .single();

    if (adopter?.USER?.AccID) {
      await createNotification({
        accId: adopter.USER.AccID,
        title: 'Adoption completed',
        message: `The adoption process for ${adopter.USERPETS?.PET?.PetName || 'your pet'} was completed by vet staff.`,
        type: 'adoption'
      });
    }

    res.json({ success: true, adoption, waiverUrl });
  } catch (error) {
    console.error('❌ Complete adoption error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

// ── GET /api/vet/announcements ────────────────────────────────────────────
router.get('/announcements', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { data: staffRow } = await supabase
      .from('VETSTAFF')
      .select('StaffID, StaffName')
      .eq('AccID', req.user.accId)
      .single();

    // Get all VETSTAFF AccIDs so we can identify vet-originated rows
    const { data: vetAccs } = await supabase
      .from('VETSTAFF')
      .select('AccID');
    const vetAccIds = (vetAccs || []).map(v => v.AccID);

    // Show:
    // 1. Pending submissions (AnnouncedBy IS NULL) — submitted by any vet
    // 2. Approved vet submissions (AnnouncedBy is an admin AccID, but originated from vet = no way to tell without extra column)
    //    → Show ALL approved announcements so vets can see published ones too
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .select('AnnounceID, AnnounceTitle, AnnounceContent, AnnounceType, AnnounceDateUpdated, created_at, AnnouncedBy')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(a => ({
      id: a.AnnounceID,
      title: a.AnnounceTitle,
      content: a.AnnounceContent,
      type: a.AnnounceType,
      createdAt: a.created_at,
      updatedAt: a.AnnounceDateUpdated,
      // pending = AnnouncedBy is null, approved = set to admin's AccID
      status: a.AnnouncedBy ? 'approved' : 'pending',
      createdBy: staffRow?.StaffName || 'Vet Staff',
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/vet/announcements ───────────────────────────────────────────
router.post('/announcements', authenticateToken, authorizeRole('vet'), async (req, res) => {  const { title, content, serviceType } = req.body;

  try {
    const { data: staffRow } = await supabase
      .from('VETSTAFF')
      .select('StaffID, StaffName')
      .eq('AccID', req.user.accId)
      .single();

    // Insert into ANNOUNCEMENT with AnnouncedBy = null (pending admin approval)
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .insert({
        AnnounceTitle: title,
        AnnounceContent: content,
        AnnounceType: serviceType || 'General',
        AnnouncedBy: null,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify admin that a vet submitted an announcement for review
    await createNotificationsForUsers({
      title: `New announcement: ${title}`,
      message: content,
      type: 'announcement',
    });

    res.status(201).json({
      id: data.AnnounceID,
      title: data.AnnounceTitle,
      content: data.AnnounceContent,
      type: data.AnnounceType,
      createdAt: data.created_at,
      status: 'pending',
      createdBy: staffRow?.StaffName || 'Vet Staff',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/vet/announcements/:id ────────────────────────────────────────
// Vet edits their own pending announcement (resets to pending if was approved)
router.put('/announcements/:id', authenticateToken, authorizeRole('vet'), async (req, res) => {
  const { title, content, serviceType } = req.body;
  try {
    const { data, error } = await supabase
      .from('ANNOUNCEMENT')
      .update({
        AnnounceTitle: title,
        AnnounceContent: content,
        AnnounceType: serviceType || 'General',
        AnnouncedBy: null,               // reset to pending for re-review
        AnnounceDateUpdated: new Date().toISOString(),
      })
      .eq('AnnounceID', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: data.AnnounceID,
      title: data.AnnounceTitle,
      content: data.AnnounceContent,
      type: data.AnnounceType,
      createdAt: data.created_at,
      status: 'pending',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/notifications', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('NOTIFICATION')
      .select('*')
      .eq('AccID', req.user.accId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((data || []).map(n => ({
      id: n.NotifID,
      title: n.NotifTitle,
      message: n.NotifMessage,
      type: n.NotifType || 'general',
      isRead: n.NotifRead,
      createdAt: n.created_at
    })));
  } catch (error) {
    console.error('Get vet notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark vet notification as read
router.patch('/notifications/:id/read', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('NOTIFICATION')
      .update({ NotifRead: true })
      .eq('NotifID', req.params.id)
      .eq('AccID', req.user.accId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: data.NotifID,
      title: data.NotifTitle,
      message: data.NotifMessage,
      type: data.NotifType || 'general',
      isRead: data.NotifRead,
      createdAt: data.created_at
    });
  } catch (error) {
    console.error('Mark vet notification read error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
