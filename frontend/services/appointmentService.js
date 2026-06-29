import api from './api';

export const appointmentService = {
  bookAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  cancelAppointment: async (appointmentId) => {
    const response = await api.patch(`/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  getServices: async () => {
    const response = await api.get('/appointments/services');
    return response.data;
  },

  getAvailableDates: async (serviceId) => {
    const response = await api.get(`/appointments/available-dates/${serviceId}`);
    return response.data;
  }
};
