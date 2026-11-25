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

// Export appointments to CSV (all statuses, full details)
router.get('/appointments/export', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    // Fetch all appointments with full details
    const { data, error } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointID,
        AppointSchedDate,
        AppointStatus,
        CancellationReason,
        created_at,
        USERPETS!APPOINTMENT_UserPetID_fkey (
          USER (
            UserName,
            UserAddress,
            ACCOUNT (
              AccEmail,
              AccPhoneNum
            )
          ),
          PET (
            PetID,
            PetName,
            PetSpecie,
            PetMarkings,
            PetGender,
            PetBDay
          )
        ),
        SERVICES!APPOINTMENT_ServID_fkey (
          ServType
        ),
        APPOINTMENTLOGS (
          LogID,
          LogAttendance,
          LogNote,
          created_at,
          ACCOUNT (
            AccUserName
          )
        )
      `)
      .order('AppointSchedDate', { ascending: false });

    if (error) throw error;

    const calculateAge = (birthday) => {
      if (!birthday) return 'N/A';
      const today = new Date();
      const birthDate = new Date(birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age > 0 ? `${age} years` : 'Less than 1 year';
    };

    // Fetch medical records per pet
    const petIds = [...new Set(data.map(a => a.USERPETS?.PET?.PetID).filter(Boolean))];
    let medicalByPet = {};
    if (petIds.length > 0) {
      // MEDICALHISTORY links to SERVICES not PET directly — fetch via ServID
      const servIds = [...new Set(data.map(a => a.SERVICES?.ServID).filter(Boolean))];
      if (servIds.length > 0) {
        const { data: medData } = await supabase
          .from('MEDICALHISTORY')
          .select('Medicine, Description, ServID, created_at')
          .in('ServID', servIds);
        // Group by ServID
        for (const m of medData || []) {
          if (!medicalByPet[m.ServID]) medicalByPet[m.ServID] = [];
          medicalByPet[m.ServID].push(`${m.Medicine}: ${m.Description || ''} (${new Date(m.created_at).toLocaleDateString()})`);
        }
      }
    }

    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const headers = [
      'Scheduled Date',
      'Service',
      'Status',
      'Patient Name',
      'Phone Number',
      'Email',
      'Pet Name',
      'Species',
      'Markings',
      'Pet Gender',
      'Age',
      'Medical Records',
      'Activity Log',
    ];

    const rows = data.map(apt => {
      const pet = apt.USERPETS?.PET || {};
      const user = apt.USERPETS?.USER || {};
      const account = user.ACCOUNT || {};
      const servId = apt.SERVICES?.ServID;

      const medRecords = medicalByPet[servId]?.join(' | ') || 'None';

      const logs = (apt.APPOINTMENTLOGS || [])
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(l => {
          const action = l.LogAttendance === true ? 'Attended' : l.LogAttendance === false ? 'No Show' : 'Updated';
          const by = l.ACCOUNT?.AccUserName || 'System';
          const note = l.LogNote || '';
          const time = new Date(l.created_at).toLocaleString();
          return `[${time}] ${action} by ${by}${note ? ': ' + note : ''}`;
        })
        .join(' | ') || 'None';

      return [
        apt.AppointSchedDate?.split('T')[0] || 'N/A',
        apt.SERVICES?.ServType || 'N/A',
        apt.AppointStatus || 'N/A',
        user.UserName || 'N/A',
        account.AccPhoneNum || 'N/A',
        account.AccEmail || 'N/A',
        pet.PetName || 'N/A',
        pet.PetSpecie || 'N/A',
        pet.PetMarkings || 'N/A',
        pet.PetGender || 'N/A',
        calculateAge(pet.PetBDay),
        medRecords,
        logs,
      ].map(escape).join(',');
    });

    const csv = [headers.map(escape).join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="appointments-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export appointments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all appointments for vet
router.get('/appointments', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    console.log('🏥 Vet get appointments request');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Escape ILIKE wildcards in user-supplied search term
    const rawQ = (req.query.q || '').trim();
    const escapedQ = rawQ.replace(/[%_\\]/g, c => `\\${c}`);
    const searchPattern = escapedQ ? `%${escapedQ}%` : null;

    // Build base query
    let query = supabase
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
              AccPhoneNum,
              AccStatus
            )
          ),
          PET (
            PetID,
            PetName,
            PetBreed,
            PetSpecie
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
      .order('AppointDateCreated', { ascending: false });

    // Apply search filter across owner name (USER.UserName) and pet name (PET.PetName).
    // Supabase supports filtering on embedded resource columns via the foreignTable syntax
    // in .or(). Using the relationship alias defined in the select above.
    if (searchPattern) {
      query = query.or(
        `UserName.ilike.${searchPattern},PetName.ilike.${searchPattern}`,
        { foreignTable: 'USERPETS' }
      );
    }

    query = query.range(startIndex, startIndex + limit - 1);

    // Get appointments with count
    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching vet appointments:', error);
      throw error;
    }
    console.log('✅ Found appointments:', data?.length || 0);

    // Transform data
    const appointments = data
      .filter(apt => {
        // Hide pending/confirmed appointments where the pet owner is suspended
        // (still show completed/cancelled so history is preserved)
        const status = (apt.AppointStatus || '').toLowerCase();
        if (status === 'completed' || status === 'cancelled') return true;
        return apt.USERPETS?.USER?.ACCOUNT?.AccStatus !== 'Suspended';
      })
      .map(apt => {
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
        type: apt.SERVICES.ServType,
        serviceType: apt.SERVICES.ServType,
        status: apt.AppointStatus.toLowerCase(),
        pets: [{
          id: apt.USERPETS.PET.PetID,
          name: apt.USERPETS.PET.PetName,
          breed: apt.USERPETS.PET.PetBreed,
          species: apt.USERPETS.PET.PetSpecie,
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

    // Get medical records for this pet via MEDICALHISTORY (vet sees all rows)
    const { data: medicalRecords } = await supabase
      .from('MEDICALHISTORY')
      .select(`
        MedID,
        Medication,
        MedDescript,
        MedSumDiagnosis,
        MedVerified,
        LogID,
        created_at,
        APPOINTMENTLOGS (
          APPOINTMENT (
            SERVICES ( ServType )
          )
        )
      `)
      .eq('UserPetID', data.USERPETS.UserPetID)
      .order('created_at', { ascending: false });

    const schedDate = new Date(data.AppointSchedDate);
    const appointment = {
      id: data.AppointID,
      userId: data.USERPETS.USER.UserID,
      userName: data.USERPETS.USER.UserName,
      userPhone: data.USERPETS.USER.ACCOUNT.AccPhoneNum || 'N/A',
      userAddress: data.USERPETS.USER.UserAddress || 'N/A',
      date: schedDate.toISOString().split('T')[0],
      type: data.SERVICES.ServType,
      serviceType: data.SERVICES.ServType,
      status: data.AppointStatus.toLowerCase(),
      pets: [{
        id: data.USERPETS.PET.PetID,
        userPetId: data.USERPETS.UserPetID,
        name: data.USERPETS.PET.PetName,
        breed: data.USERPETS.PET.PetBreed,
        species: data.USERPETS.PET.PetSpecie,
        gender: data.USERPETS.PET.PetGender,
        markings: data.USERPETS.PET.PetMarkings,
        age: calculateAge(data.USERPETS.PET.PetBDay)
      }],
      medicalRecords: (medicalRecords || []).map(record => ({
        medId: record.MedID,
        medication: record.Medication,
        medDescript: record.MedDescript,
        medVerified: record.MedVerified === true,
        medSumDiagnosis: record.MedSumDiagnosis || null,
        logId: record.LogID,
        serviceName: record.APPOINTMENTLOGS?.APPOINTMENT?.SERVICES?.ServType || null,
        createdAt: record.created_at,
      })),
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

// Mark attendance (and optionally insert a medical history row)
router.patch('/appointments/:id/attendance', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { attended, note, medication, medDescript } = req.body;

    console.log('📋 Marking attendance:', { appointmentId: req.params.id, attended, staffId: req.user.accId });

    // Insert into APPOINTMENTLOGS
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

    // If patient showed up AND medical info provided, insert a MEDICALHISTORY row
    // Extract all three medical fields from the request body
    const medSumDiagnosis = req.body.note || null;

    let medRecord = null;
    if (attended && (medication || medDescript || medSumDiagnosis)) {
      // Resolve UserPetID from the appointment
      const { data: aptRow, error: aptErr } = await supabase
        .from('APPOINTMENT')
        .select('UserPetID')
        .eq('AppointID', req.params.id)
        .single();

      if (!aptErr && aptRow) {
        const { data: medData, error: medErr } = await supabase
          .from('MEDICALHISTORY')
          .insert({
            UserPetID: aptRow.UserPetID,
            LogID: logData.LogID,
            Medication: medication || '',
            MedDescript: medDescript || null,
            MedSumDiagnosis: medSumDiagnosis,
            MedVerified: true,
          })
          .select()
          .single();

        if (medErr) console.error('⚠️ Error inserting medical history:', medErr);
        else medRecord = medData;
      }
    }

    // If patient did NOT attend — send a direct message + notification to the user
    if (!attended) {
      try {
        // Resolve the appointment's owner info
        const { data: aptInfo } = await supabase
          .from('APPOINTMENT')
          .select(`
            AppointSchedDate,
            USERPETS!APPOINTMENT_UserPetID_fkey (
              USER (
                UserID,
                AccID
              ),
              PET ( PetName )
            ),
            SERVICES!APPOINTMENT_ServID_fkey ( ServType )
          `)
          .eq('AppointID', req.params.id)
          .single();

        if (aptInfo) {
          const userID   = aptInfo.USERPETS?.USER?.UserID;
          const userAccID = aptInfo.USERPETS?.USER?.AccID;
          const petName  = aptInfo.USERPETS?.PET?.PetName  || 'your pet';
          const servType = aptInfo.SERVICES?.ServType      || 'your appointment';
          const schedDate = aptInfo.AppointSchedDate
            ? new Date(aptInfo.AppointSchedDate).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
              })
            : 'the scheduled date';

          const missedMsg =
            `Your appointment for ${petName} (${servType}) on ${schedDate} was marked as missed. ` +
            `Please contact us to reschedule.`;

          // Find a system sender: use the vet's own UserID as MessFrom if they're also a user,
          // otherwise insert an ANNOUNCEMENT-style message via the vet's account acting as admin.
          // Per schema MESSAGES requires USER FKs for both sides — we look up the vet's UserID.
          const { data: vetUserRow } = await supabase
            .from('USER')
            .select('UserID')
            .eq('AccID', req.user.accId)
            .maybeSingle();

          if (userID && vetUserRow?.UserID) {
            await supabase.from('MESSAGES').insert({
              MessFrom: vetUserRow.UserID,
              MessTo:   userID,
              MessContent: missedMsg,
            });
          }

          // Always send a notification regardless of message delivery
          if (userAccID) {
            await createNotification({
              accId:   userAccID,
              title:   'Missed appointment',
              message: missedMsg,
              type:    'appointment',
            });
          }
        }
      } catch (notifErr) {
        console.error('⚠️ No-show notification error:', notifErr);
        // non-fatal — continue
      }
    }

    // Return the appointment data (status remains unchanged)
    const { data: appointment, error: appointError } = await supabase
      .from('APPOINTMENT')
      .select('*')
      .eq('AppointID', req.params.id)
      .single();

    if (appointError) throw appointError;

    res.json({ success: true, appointment, log: logData, medRecord });
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

// ── GET /vet/dashboard/completed-appointments ─────────────────────────────
// Returns appointments that have an APPOINTMENTLOGS row with LogAttendance=true
// (the patient "showed up"). This is the only authoritative completion signal —
// AppointStatus is never updated by the attendance route, so we query the log
// table directly. Returns data in the same shape as GET /vet/appointments.
router.get('/dashboard/completed-appointments', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 500;

    // Pull every attendance log that recorded a "show"
    const { data: logs, error: logError } = await supabase
      .from('APPOINTMENTLOGS')
      .select(`
        LogID,
        AppointID,
        LogNote,
        created_at,
        APPOINTMENT!APPOINTMENTLOGS_AppointID_fkey (
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
              PetBreed,
              PetSpecie
            )
          ),
          SERVICES!APPOINTMENT_ServID_fkey (
            ServID,
            ServType
          )
        )
      `)
      .eq('LogAttendance', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (logError) {
      console.error('❌ Error fetching completed appointments:', logError);
      throw logError;
    }

    // De-duplicate: one appointment may have multiple attendance logs.
    // Keep the most-recent log per appointment (already sorted desc).
    const seen = new Set();
    const unique = (logs || []).filter(log => {
      if (!log.APPOINTMENT) return false;
      const id = log.APPOINTMENT.AppointID;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const appointments = unique.map(log => {
      const apt = log.APPOINTMENT;
      const schedDate = new Date(apt.AppointSchedDate);
      return {
        id: apt.AppointID,
        logId: log.LogID,
        userId: apt.USERPETS.USER.UserID,
        userName: apt.USERPETS.USER.UserName,
        userPhone: apt.USERPETS.USER.ACCOUNT?.AccPhoneNum || 'N/A',
        date: schedDate.toISOString().split('T')[0],
        time: schedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        type: apt.SERVICES.ServType,
        serviceType: apt.SERVICES.ServType,
        // Always "completed" for dashboard purposes — these all have LogAttendance=true
        status: 'completed',
        pets: [{
          id: apt.USERPETS.PET.PetID,
          name: apt.USERPETS.PET.PetName,
          breed: apt.USERPETS.PET.PetBreed,
          species: apt.USERPETS.PET.PetSpecie,
        }],
        attended: true,
        createdAt: apt.AppointDateCreated,
        notes: log.LogNote || '',
        completedAt: log.created_at,
      };
    });

    console.log(`✅ Dashboard completed appointments: ${appointments.length}`);
    res.json({
      appointments,
      total: appointments.length,
      page: 1,
      totalPages: 1,
    });
  } catch (error) {
    console.error('❌ Dashboard completed appointments error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
});

// Verify (confirm) a medical history entry — sets MedVerified=true
router.patch('/medical-history/:medId/verify', authenticateToken, authorizeRole('vet'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('MEDICALHISTORY')
      .update({ MedVerified: true })
      .eq('MedID', req.params.medId)
      .select(`
        MedID,
        Medication,
        MedDescript,
        MedSumDiagnosis,
        MedVerified,
        LogID,
        created_at,
        APPOINTMENTLOGS (
          APPOINTMENT (
            SERVICES ( ServType )
          )
        )
      `)
      .single();

    if (error) throw error;
    res.json({
      medId: data.MedID,
      medication: data.Medication,
      medDescript: data.MedDescript,
      medVerified: data.MedVerified,
      logId: data.LogID,
      serviceName: data.APPOINTMENTLOGS?.APPOINTMENT?.SERVICES?.ServType || null,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('Verify medical history error:', error);
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
            PetID,
            PetName
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

    // ── Adoption completion: ownership transfer + soft-delete other requests ──

    // 1. Find the completed adoption's UserPetsID (original owner's USERPETS row)
    const { data: completedAdoption } = await supabase
      .from('ADOPTION')
      .select(`
        UserPetsID,
        UserID,
        USER!ADOPTION_UserID_fkey ( AccID, UserID ),
        USERPETS!ADOPTION_UserPetsID_fkey ( UserPetID, PetID, UserID )
      `)
      .eq('AdoptID', req.params.id)
      .single();

    const completedUserPetsID = completedAdoption?.UserPetsID;
    const originalOwnerUserPetID = completedAdoption?.USERPETS?.UserPetID;
    const adoptedPetID = completedAdoption?.USERPETS?.PetID;
    // The adopter's UserID is stored in ADOPTION.UserID
    const adopterUserID = completedAdoption?.UserID;

    // 2. Soft-delete ALL other adoption requests for the same UserPetsID (not the completed one)
    if (completedUserPetsID) {
      const { data: otherRequests } = await supabase
        .from('ADOPTION')
        .select('AdoptID, USER!ADOPTION_UserID_fkey(AccID)')
        .eq('UserPetsID', completedUserPetsID)
        .neq('AdoptID', req.params.id);

      if (otherRequests?.length > 0) {
        await supabase
          .from('ADOPTION')
          .update({ AdoptIsDeleted: true })
          .in('AdoptID', otherRequests.map(r => r.AdoptID));

        // Notify the other applicants
        for (const other of otherRequests) {
          if (other.USER?.AccID) {
            await createNotification({
              accId: other.USER.AccID,
              title: 'Adoption unavailable',
              message: `Sorry, ${adoption.USERPETS?.PET?.PetName || 'this pet'} has already been adopted by someone else.`,
              type: 'adoption',
            });
          }
        }
      }
    }

    // 3. Mark original owner's USERPETS row as deleted
    if (originalOwnerUserPetID) {
      await supabase
        .from('USERPETS')
        .update({ UserPetIsDeleted: true })
        .eq('UserPetID', originalOwnerUserPetID);
    }

    // 4. Insert a new USERPETS row for the adopter
    if (adopterUserID && adoptedPetID) {
      await supabase
        .from('USERPETS')
        .insert({
          UserID: adopterUserID,
          PetID: adoptedPetID,
          UserPetIsDeleted: false,
          created_at: new Date().toISOString(),
        });
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
