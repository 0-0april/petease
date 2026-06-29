import { supabase } from '../config/supabase';

export const storageService = {
  // Upload pet image to 'pet-images' bucket
  uploadPetImage: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('pet-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('pet-images')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // Upload adoption waiver to 'adoption-waivers' bucket
  uploadAdoptionWaiver: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('adoption-waivers')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('adoption-waivers')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // Delete file from bucket
  deleteFile: async (bucket, filePath) => {
    const fileName = filePath.split('/').pop();
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) throw error;
    return { success: true };
  }
};
