import api from './api';

// Helper to get full Supabase storage URL
const getStorageUrl = (path, username) => {
  console.log('getStorageUrl called with:', { path, username });
  
  if (!path) return null;
  if (path.startsWith('http')) return path; // Already a full URL
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  // Remove any 'pet-images/' prefix if it exists
  let cleanPath = path.replace(/^pet-images\//, '');
  
  // If the path doesn't already have a username prefix and we have a username, add it
  if (username && !cleanPath.includes('_')) {
    // Extract just the filename without any path
    const filename = cleanPath.split('/').pop();
    cleanPath = `${username}_${filename}`;
  }
  
  const finalUrl = `${supabaseUrl}/storage/v1/object/public/pet-images/${cleanPath}`;
  console.log('Generated URL:', finalUrl);
  
  return finalUrl;
};

export const petService = {
  getAllPets: async () => {
    const response = await api.get('/pets');
    // Map database fields to frontend format
    return response.data.map(pet => ({
      id: pet.PetID,
      name: pet.PetName,
      birthday: pet.PetBDay,
      species: pet.PetSpecie,
      type: pet.PetSpecie,
      breed: pet.PetBreed,
      markings: pet.PetMarkings,
      color: pet.PetMarkings,
      gender: pet.PetGender,
      description: pet.PetDetails,
      image: getStorageUrl(pet.PetImg, pet.owner_username),
      status: pet.PetAvailable ? 'available' : 'adopted',
      ownerId: pet.ownerId, // Now using the aliased field from backend
      ownerName: pet.owner_name,
      ownerUsername: pet.owner_username
    }));
  },

  getPetById: async (id) => {
    const response = await api.get(`/pets/${id}`);
    const pet = response.data;
    return {
      id: pet.PetID,
      name: pet.PetName,
      birthday: pet.PetBDay,
      species: pet.PetSpecie,
      type: pet.PetSpecie,
      breed: pet.PetBreed,
      markings: pet.PetMarkings,
      color: pet.PetMarkings,
      gender: pet.PetGender,
      description: pet.PetDetails,
      image: getStorageUrl(pet.PetImg, pet.owner_username),
      status: pet.PetAvailable ? 'available' : 'adopted',
      ownerId: pet.ownerId, // Now using the aliased field from backend
      ownerName: pet.owner_name,
      ownerUsername: pet.owner_username
    };
  },

  getMyPets: async () => {
    const response = await api.get('/pets/my-pets');
    return response.data.map(pet => ({
      id: pet.PetID,
      name: pet.PetName,
      birthday: pet.PetBDay,
      species: pet.PetSpecie,
      type: pet.PetSpecie,
      breed: pet.PetBreed,
      markings: pet.PetMarkings,
      color: pet.PetMarkings,
      gender: pet.PetGender,
      description: pet.PetDetails,
      image: getStorageUrl(pet.PetImg, pet.owner_username),
      status: pet.PetAvailable ? 'available' : 'adopted',
      ownerId: pet.UserID,
      ownerUsername: pet.owner_username,
      registrationType: pet.PetRegType === 'Adoption' ? 'adoption' : pet.PetRegType === 'Both' ? 'both' : 'appointment'
    }));
  },

  createPet: async (petData) => {
    // petData is now FormData
    const response = await api.post('/pets', petData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const pet = response.data;
    return {
      id: pet.PetID,
      name: pet.PetName,
      birthday: pet.PetBDay,
      species: pet.PetSpecie,
      breed: pet.PetBreed,
      markings: pet.PetMarkings,
      gender: pet.PetGender,
      description: pet.PetDetails,
      image: getStorageUrl(pet.PetImg),
      status: pet.PetAvailable ? 'available' : 'adopted'
    };
  },

  updatePet: async (id, petData) => {
    // petData is now FormData
    const response = await api.put(`/pets/${id}`, petData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const pet = response.data;
    return {
      id: pet.PetID,
      name: pet.PetName,
      birthday: pet.PetBDay,
      species: pet.PetSpecie,
      breed: pet.PetBreed,
      markings: pet.PetMarkings,
      gender: pet.PetGender,
      description: pet.PetDetails,
      image: getStorageUrl(pet.PetImg),
      status: pet.PetAvailable ? 'available' : 'adopted'
    };
  },

  deletePet: async (id) => {
    await api.delete(`/pets/${id}`);
    return { success: true };
  },

  getMedicalHistory: async (petId) => {
    const response = await api.get(`/pets/${petId}/medical-history`);
    return response.data;
  }
};
