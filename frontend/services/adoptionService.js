import api from './api';
import { supabase } from '../config/supabase';

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
    const mapped = response.data.map(req => ({
      id: req.AdoptID,
      petId: req.PetID,
      petName: req.PetName,
      petImage: req.PetImg,
      petBreed: req.PetBreed,
      ownerId: req.OwnerUserID,
      ownerName: req.owner_name,
      status: req.AdoptStatus?.toLowerCase() || 'pending',
      message: req.AdoptionWaiver,
      waiverUrl: null,
      rejectionReason: req.RejectionReason,
      createdAt: req.AdoptReqDate
    }));

    // Pull fresh status + waiver directly from Supabase to bypass stale Railway data
    const ids = mapped.map(r => r.id).filter(Boolean);
    if (ids.length > 0) {
      const { data: rows } = await supabase
        .from('ADOPTION')
        .select('AdoptID, AdoptStatus, AdoptionWaiver')
        .in('AdoptID', ids);
      if (rows) {
        const map = {};
        rows.forEach(r => { map[r.AdoptID] = r; });
        mapped.forEach(r => {
          const row = map[r.id];
          if (row) {
            r.status = row.AdoptStatus?.toLowerCase() || r.status;
            const w = row.AdoptionWaiver;
            r.waiverUrl = r.status === 'completed' && w?.startsWith('http') ? w : null;
          }
        });
      }
    }
    return mapped;
  },

  getIncomingRequests: async () => {
    const response = await api.get('/adoptions/incoming');
    const mapped = response.data.map(req => ({
      id: req.AdoptID,
      petId: req.PetID,
      petName: req.PetName,
      petImage: req.PetImg,
      petBreed: req.PetBreed,
      adopterId: req.AdopterUserID,
      adopterName: req.adopter_name,
      adopterEmail: req.adopter_email,
      adopterPhone: req.adopter_phone,
      status: req.AdoptStatus?.toLowerCase() || 'pending',
      message: req.AdoptionWaiver,
      waiverUrl: null,
      rejectionReason: req.RejectionReason,
      createdAt: req.AdoptReqDate
    }));

    // Pull fresh status + waiver directly from Supabase to bypass stale Railway data
    const ids = mapped.map(r => r.id).filter(Boolean);
    if (ids.length > 0) {
      const { data: rows } = await supabase
        .from('ADOPTION')
        .select('AdoptID, AdoptStatus, AdoptionWaiver')
        .in('AdoptID', ids);
      if (rows) {
        const map = {};
        rows.forEach(r => { map[r.AdoptID] = r; });
        mapped.forEach(r => {
          const row = map[r.id];
          if (row) {
            r.status = row.AdoptStatus?.toLowerCase() || r.status;
            const w = row.AdoptionWaiver;
            r.waiverUrl = r.status === 'completed' && w?.startsWith('http') ? w : null;
          }
        });
      }
    }
    return mapped;
  }
};
