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

  getMyAdoptionRequests: async () => {
    const response = await api.get('/adoptions/my-requests');
    return response.data.map(req => {
      const status = req.AdoptStatus?.toLowerCase() || 'pending';
      const waiver = req.AdoptionWaiver || '';
      return {
        id: req.AdoptID,
        petId: req.PetID,
        petName: req.PetName,
        petImage: req.PetImg,
        petBreed: req.PetBreed,
        ownerId: req.OwnerUserID,
        ownerName: req.owner_name,
        status,
        message: status !== 'completed' ? waiver : null,
        waiverUrl: status === 'completed' && waiver.startsWith('http') ? waiver : null,
        rejectionReason: req.RejectionReason,
        createdAt: req.AdoptReqDate
      };
    });
  },

  getIncomingRequests: async () => {
    const response = await api.get('/adoptions/incoming');
    return response.data.map(req => {
      const status = req.AdoptStatus?.toLowerCase() || 'pending';
      const waiver = req.AdoptionWaiver || '';
      return {
        id: req.AdoptID,
        petId: req.PetID,
        petName: req.PetName,
        petImage: req.PetImg,
        petBreed: req.PetBreed,
        adopterId: req.AdopterUserID,
        adopterName: req.adopter_name,
        adopterEmail: req.adopter_email,
        adopterPhone: req.adopter_phone,
        status,
        message: status !== 'completed' ? waiver : null,
        waiverUrl: status === 'completed' && waiver.startsWith('http') ? waiver : null,
        rejectionReason: req.RejectionReason,
        createdAt: req.AdoptReqDate
      };
    });
  }
};
