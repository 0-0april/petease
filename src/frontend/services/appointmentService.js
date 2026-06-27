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

  getAvailableDates: async (appointmentType) => {
    const response = await api.get(`/appointments/available-dates/${appointmentType}`);
    return response.data;
  }
};
