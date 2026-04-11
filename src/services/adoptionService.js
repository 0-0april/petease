import api from './api';

export const adoptionService = {
  requestAdoption: async (petId, message = '', waiverFile = null) => {
    const formData = new FormData();
    formData.append('userPetId', petId);
    formData.append('message', message);
    if (waiverFile) {
      formData.append('waiver', waiverFile);
    }

    const response = await api.post('/adoptions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  cancelAdoption: async (adoptionId) => {
    const response = await api.put(`/adoptions/${adoptionId}/cancel`);
    return response.data;
  },

  approveAdoption: async (adoptionId) => {
    const response = await api.put(`/adoptions/${adoptionId}/approve`);
    return response.data;
  },

  rejectAdoption: async (adoptionId, reason = '') => {
    const response = await api.put(`/adoptions/${adoptionId}/reject`, { reason });
    return response.data;
  },

  completeAdoption: async (adoptionId) => {
    const response = await api.put(`/adoptions/${adoptionId}/complete`);
    return response.data;
  },

  uploadWaiver: async (adoptionId, waiverFile) => {
    const formData = new FormData();
    formData.append('waiver', waiverFile);
    const response = await api.post(`/adoptions/${adoptionId}/waiver`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Called by vet to finalize adoption
  completeAdoption: async (adoptionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = adoptionRequests.findIndex(r => r.id === parseInt(adoptionId));
    if (index !== -1) {
      adoptionRequests[index].status = 'completed';
      adoptionRequests[index].completedAt = new Date().toISOString();
      return adoptionRequests[index];
    }
    throw new Error('Request not found');
  },

  // Requests sent by the current user (as adopter)
  getMyAdoptionRequests: async () => {
    const response = await api.get('/adoptions/my-requests');
    return response.data;
  },

  getIncomingRequests: async () => {
    const response = await api.get('/adoptions/incoming');
    return response.data;
  }
};
