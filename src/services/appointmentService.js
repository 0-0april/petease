import { mockAppointments, mockAvailableDates, mockPets } from '../data/mockData';

let appointments = [...mockAppointments];

export const appointmentService = {
  bookAppointment: async (appointmentData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const pets = mockPets.filter(p => appointmentData.petIds.includes(p.id));
    const newAppointment = {
      id: appointments.length + 1,
      userId: user.id,
      type: appointmentData.type,
      date: appointmentData.date,
      status: 'confirmed',
      pets: pets.map(p => ({ id: p.id, name: p.name })),
      createdAt: new Date().toISOString()
    };
    appointments.push(newAppointment);
    return newAppointment;
  },

  getMyAppointments: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return appointments.filter(a => a.userId === user.id);
  },

  cancelAppointment: async (appointmentId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = appointments.findIndex(a => a.id === parseInt(appointmentId));
    if (index !== -1) {
      appointments[index].status = 'cancelled';
      return appointments[index];
    }
    throw new Error('Appointment not found');
  },

  getAvailableDates: async (appointmentType) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAvailableDates;
  }
};
