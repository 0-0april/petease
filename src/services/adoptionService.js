import { mockAdoptionRequests, mockPets } from '../data/mockData';

let adoptionRequests = [...mockAdoptionRequests];

export const adoptionService = {
  // Submit a new adoption request (as adopter)
  requestAdoption: async (petId, message = '') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const pet = mockPets.find(p => p.id === parseInt(petId));
    const newRequest = {
      id: adoptionRequests.length + 1,
      petId: parseInt(petId),
      petName: pet?.name,
      adopterId: user.id,
      adopterName: user.name,
      adopterEmail: user.email,
      adopterPhone: user.phone,
      ownerId: pet?.ownerId,
      status: 'pending',
      message,
      rejectionReason: null,
      createdAt: new Date().toISOString()
    };
    adoptionRequests.push(newRequest);
    return newRequest;
  },

  // Cancel own adoption request (as adopter)
  cancelAdoption: async (adoptionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = adoptionRequests.findIndex(r => r.id === parseInt(adoptionId));
    if (index !== -1) {
      adoptionRequests[index].status = 'cancelled';
      return adoptionRequests[index];
    }
    throw new Error('Request not found');
  },

  // Approve an incoming request (as pet owner)
  approveAdoption: async (adoptionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = adoptionRequests.findIndex(r => r.id === parseInt(adoptionId));
    if (index !== -1) {
      adoptionRequests[index].status = 'approved';
      adoptionRequests[index].rejectionReason = null;
      return adoptionRequests[index];
    }
    throw new Error('Request not found');
  },

  // Reject an incoming request with a reason (as pet owner)
  rejectAdoption: async (adoptionId, reason = '') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = adoptionRequests.findIndex(r => r.id === parseInt(adoptionId));
    if (index !== -1) {
      adoptionRequests[index].status = 'rejected';
      adoptionRequests[index].rejectionReason = reason;
      return adoptionRequests[index];
    }
    throw new Error('Request not found');
  },

  // Requests sent by the current user (as adopter)
  getMyAdoptionRequests: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return adoptionRequests.filter(r => r.adopterId === user.id);
  },

  // Incoming requests for the current user's pets (as owner)
  getIncomingRequests: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return adoptionRequests.filter(r => r.ownerId === user.id);
  }
};
