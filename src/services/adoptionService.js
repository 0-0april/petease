import { mockAdoptionRequests, mockPets } from '../data/mockData';

let adoptionRequests = [...mockAdoptionRequests];

export const adoptionService = {
  requestAdoption: async (petId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const pet = mockPets.find(p => p.id === parseInt(petId));
    const newRequest = {
      id: adoptionRequests.length + 1,
      petId: parseInt(petId),
      petName: pet?.name,
      adopterId: user.id,
      adopterName: user.name,
      ownerId: pet?.ownerId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    adoptionRequests.push(newRequest);
    return newRequest;
  },

  cancelAdoption: async (adoptionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = adoptionRequests.findIndex(r => r.id === parseInt(adoptionId));
    if (index !== -1) {
      adoptionRequests[index].status = 'cancelled';
      return adoptionRequests[index];
    }
    throw new Error('Request not found');
  },

  approveAdoption: async (adoptionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = adoptionRequests.findIndex(r => r.id === parseInt(adoptionId));
    if (index !== -1) {
      adoptionRequests[index].status = 'approved';
      return adoptionRequests[index];
    }
    throw new Error('Request not found');
  },

  rejectAdoption: async (adoptionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = adoptionRequests.findIndex(r => r.id === parseInt(adoptionId));
    if (index !== -1) {
      adoptionRequests[index].status = 'rejected';
      return adoptionRequests[index];
    }
    throw new Error('Request not found');
  },

  getMyAdoptionRequests: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return adoptionRequests.filter(r => r.ownerId === user.id);
  }
};
