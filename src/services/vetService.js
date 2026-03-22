import { mockAppointments, mockAppointmentLogs, mockAnnouncements, mockAdoptionWaivers, mockMedicalHistory } from '../data/mockData';
import { adoptionRequests } from './adoptionService';

let appointments = [...mockAppointments];
let appointmentLogs = [...mockAppointmentLogs];
let announcements = [...mockAnnouncements];
let medicalHistory = [...mockMedicalHistory];
let adoptionWaivers = [...mockAdoptionWaivers];

export const vetService = {
  getAllAppointments: async (page = 1, limit = 10) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const sortedAppointments = [...appointments].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    return {
      appointments: sortedAppointments.slice(startIndex, endIndex),
      total: appointments.length,
      page,
      totalPages: Math.ceil(appointments.length / limit)
    };
  },

  getAppointmentById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return appointments.find(a => a.id === parseInt(id));
  },

  confirmAppointment: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = appointments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      appointments[index].status = 'confirmed';
      const log = {
        id: appointmentLogs.length + 1,
        appointmentId: parseInt(id),
        action: 'confirmed',
        performedBy: 'Dr. Sarah Wilson',
        notes: 'Appointment confirmed by vet staff',
        timestamp: new Date().toISOString()
      };
      appointmentLogs.push(log);
      return appointments[index];
    }
    throw new Error('Appointment not found');
  },

  cancelAppointment: async (id, reason) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = appointments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      appointments[index].status = 'cancelled';
      const log = {
        id: appointmentLogs.length + 1,
        appointmentId: parseInt(id),
        action: 'cancelled',
        performedBy: 'Dr. Sarah Wilson',
        notes: reason || 'Cancelled by vet staff',
        timestamp: new Date().toISOString()
      };
      appointmentLogs.push(log);
      return appointments[index];
    }
    throw new Error('Appointment not found');
  },

  markAttendance: async (id, attended) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = appointments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      appointments[index].attended = attended;
      if (attended) {
        appointments[index].status = 'completed';
      }
      const log = {
        id: appointmentLogs.length + 1,
        appointmentId: parseInt(id),
        action: attended ? 'attended' : 'no-show',
        performedBy: 'Dr. Sarah Wilson',
        notes: attended ? 'Patient attended appointment' : 'Patient did not show up',
        timestamp: new Date().toISOString()
      };
      appointmentLogs.push(log);
      return appointments[index];
    }
    throw new Error('Appointment not found');
  },

  getAppointmentLogs: async (appointmentId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return appointmentLogs.filter(log => log.appointmentId === parseInt(appointmentId));
  },

  getAllAppointmentLogs: async (page = 1, limit = 10) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const sortedLogs = [...appointmentLogs].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    return {
      logs: sortedLogs.slice(startIndex, endIndex),
      total: appointmentLogs.length,
      page,
      totalPages: Math.ceil(appointmentLogs.length / limit)
    };
  },

  addMedicalHistory: async (petId, medicalData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newRecord = {
      id: medicalHistory.length + 1,
      petId: parseInt(petId),
      medication: medicalData.medication,
      date: medicalData.date,
      notes: medicalData.notes,
      veterinarian: 'Dr. Sarah Wilson',
      diagnosis: medicalData.diagnosis,
      treatment: medicalData.treatment,
      followUp: medicalData.followUp,
      createdAt: new Date().toISOString()
    };
    medicalHistory.push(newRecord);
    return newRecord;
  },

  createAnnouncement: async (announcementData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newAnnouncement = {
      id: announcements.length + 1,
      ...announcementData,
      createdAt: new Date().toISOString(),
      createdBy: 'Dr. Sarah Wilson'
    };
    announcements.push(newAnnouncement);
    return newAnnouncement;
  },

  getAnnouncements: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Get all approved adoptions waiting for vet processing
  getApprovedAdoptions: async (page = 1, limit = 10) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const approved = adoptionRequests.filter(r => r.status === 'approved' || r.status === 'completed');
    const sorted = [...approved].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return {
      adoptions: sorted.slice(startIndex, endIndex),
      total: approved.length,
      totalPages: Math.ceil(approved.length / limit)
    };
  },

  // Complete adoption: upload waiver + add medical record + mark completed
  completeAdoption: async (adoptionId, waiverData, medicalData) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Save waiver
    const waiver = {
      id: adoptionWaivers.length + 1,
      adoptionRequestId: parseInt(adoptionId),
      waiverDocument: waiverData.waiverDocument,
      uploadedBy: 'Dr. Sarah Wilson',
      uploadedAt: new Date().toISOString(),
      ownerSignature: true,
      adopterSignature: true,
      witnessSignature: true
    };
    adoptionWaivers.push(waiver);

    // Save medical record
    if (medicalData?.service) {
      const record = {
        id: medicalHistory.length + 1,
        petId: medicalData.petId,
        medication: medicalData.service,
        date: new Date().toISOString().split('T')[0],
        notes: medicalData.notes || 'Service performed during adoption meetup',
        veterinarian: 'Dr. Sarah Wilson',
        createdAt: new Date().toISOString()
      };
      medicalHistory.push(record);
    }

    // Mark adoption completed via shared array
    const index = adoptionRequests.findIndex(r => r.id === parseInt(adoptionId));
    if (index !== -1) {
      adoptionRequests[index].status = 'completed';
      adoptionRequests[index].completedAt = new Date().toISOString();
      adoptionRequests[index].waiverDocument = waiverData.waiverDocument;
    }

    return { waiver };
  },

  exportAppointmentsToCSV: async (appointments) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const headers = ['ID', 'Date', 'Time', 'Type', 'Patient Name', 'Pet Name', 'Status', 'Phone', 'Notes'];
    const rows = appointments.map(apt => [
      apt.id,
      apt.date,
      apt.time,
      apt.type,
      apt.userName,
      apt.pets.map(p => p.name).join(', '),
      apt.status,
      apt.userPhone,
      apt.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  },

  // Services Management
  getServices: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const services = [
      {
        id: 1,
        name: 'Spay/Neuter',
        description: 'Surgical sterilization procedure for pets',
        availabilityType: 'recurring',
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 2,
        name: 'Consultation',
        description: 'General health check and consultation',
        availabilityType: 'recurring',
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 3,
        name: 'Anti-Rabies Vaccination',
        description: 'Rabies vaccination for dogs and cats',
        availabilityType: 'specific',
        specificDate: '2024-04-15',
        createdAt: '2024-01-15T10:00:00Z',
      },
    ];
    return services;
  },

  createService: async (serviceData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newService = {
      id: Date.now(),
      ...serviceData,
      createdAt: new Date().toISOString(),
    };
    return newService;
  },

  updateService: async (id, serviceData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, this would update the service and notify users
    if (serviceData.notifyUsers) {
      // Simulate notification to all users
      console.log(`Notifying all users about service update: ${serviceData.name}`);
    }
    return { id, ...serviceData, updatedAt: new Date().toISOString() };
  },

  deleteService: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
};
