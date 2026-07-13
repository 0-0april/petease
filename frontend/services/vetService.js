import { mockAnnouncements, mockAdoptionWaivers, mockMedicalHistory } from '../data/mockData';
import api from './api';

let announcements = [...mockAnnouncements];
let medicalHistory = [...mockMedicalHistory];
let adoptionWaivers = [...mockAdoptionWaivers];

export const vetService = {
  getAllAppointments: async (page = 1, limit = 10) => {
    const response = await api.get('/vet/appointments', { params: { page, limit } });
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/vet/appointments/${id}`);
    return response.data;
  },

  confirmAppointment: async (id) => {
    const response = await api.patch(`/vet/appointments/${id}/confirm`);
    return response.data;
  },

  cancelAppointment: async (id, reason) => {
    const response = await api.patch(`/vet/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  markAttendance: async (id, attended) => {
    const response = await api.patch(`/vet/appointments/${id}/attendance`, { attended });
    return response.data;
  },

  getAppointmentLogs: async (appointmentId) => {
    const response = await api.get(`/vet/appointments/${appointmentId}/logs`);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/vet/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.patch(`/vet/notifications/${id}/read`);
    return response.data;
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
    const response = await api.post('/vet/announcements', announcementData);
    return response.data;
  },

  getAnnouncements: async () => {
    const response = await api.get('/vet/announcements');
    return response.data;
  },

  // Get all approved adoptions waiting for vet processing
  getApprovedAdoptions: async (page = 1, limit = 10) => {
    const response = await api.get('/vet/adoptions', { params: { page, limit } });
    return response.data;
  },

  // Complete adoption: upload waiver + add medical record + mark completed
  completeAdoption: async (adoptionId, formData) => {
    const response = await api.post(`/vet/adoptions/${adoptionId}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
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
    const response = await api.get('/vet/services');
    return response.data;
  },

  createService: async (serviceData) => {
    const response = await api.post('/vet/services', serviceData);
    return response.data;
  },

  updateService: async (id, serviceData) => {
    const response = await api.put(`/vet/services/${id}`, serviceData);
    return response.data;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/vet/services/${id}`);
    return response.data;
  },
};
