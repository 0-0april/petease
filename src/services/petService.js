import { mockPets, mockMedicalHistory } from '../data/mockData';

let pets = [...mockPets];

export const petService = {
  getAllPets: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return pets.filter(p => p.status === 'available');
  },

  getPetById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return pets.find(p => p.id === parseInt(id));
  },

  getMyPets: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return pets.filter(p => p.ownerId === user.id);
  },

  createPet: async (petData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const newPet = {
      id: pets.length + 1,
      ...petData,
      status: 'available',
      ownerId: user.id
    };
    pets.push(newPet);
    return newPet;
  },

  updatePet: async (id, petData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = pets.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      pets[index] = { ...pets[index], ...petData };
      return pets[index];
    }
    throw new Error('Pet not found');
  },

  deletePet: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    pets = pets.filter(p => p.id !== parseInt(id));
    return { success: true };
  },

  getMedicalHistory: async (petId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMedicalHistory.filter(m => m.petId === parseInt(petId));
  }
};
