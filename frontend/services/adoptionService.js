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
    // Map backend fields to frontend format for SENT requests
    return response.data.map(req => ({
      id: req.AdoptID,
      petId: req.PetID, // The actual PetID from the PET table
      petName: req.PetName,
      petImage: req.PetImg,
      petBreed: req.PetBreed,
      ownerId: req.OwnerUserID, // The owner's UserID
      ownerName: req.owner_name,
      status: req.AdoptStatus?.toLowerCase() || 'pending',
      message: req.AdoptionWaiver,
      rejectionReason: req.RejectionReason,
      createdAt: req.AdoptReqDate
    }));
  },

  getIncomingRequests: async () => {
    const response = await api.get('/adoptions/incoming');
    // Map backend fields to frontend format for RECEIVED requests
    return response.data.map(req => ({
      id: req.AdoptID,
      petId: req.PetID, // The actual PetID from the PET table
      petName: req.PetName,
      petImage: req.PetImg,
      petBreed: req.PetBreed,
      adopterId: req.AdopterUserID, // The adopter's UserID
      adopterName: req.adopter_name,
      adopterEmail: req.adopter_email,
      adopterPhone: req.adopter_phone,
      status: req.AdoptStatus?.toLowerCase() || 'pending',
      message: req.AdoptionWaiver,
      rejectionReason: req.RejectionReason,
      createdAt: req.AdoptReqDate
    }));
  }
};
