import { mockAppointments, mockAppointmentLogs, mockAnnouncements, mockAdoptionRequests, mockAdoptionWaivers, mockMedicalHistory } from '../data/mockData';

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

  getPendingAdoptions: async (page = 1, limit = 10) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pending = mockAdoptionRequests.filter(r => r.status === 'pending');
    return {
      adoptions: pending.slice(startIndex, endIndex),
      total: pending.length,
      page,
      totalPages: Math.ceil(pending.length / limit)
    };
  },

  confirmAdoptionWithWaiver: async (adoptionId, waiverData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
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
    return waiver;
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
  }
};
