import { supabase } from '../../../_lib/supabase.js';
import { getUserWithRole } from '../../../_lib/auth.js';

const calculateAge = (birthday) => {
  if (!birthday) return null;
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age > 0 ? `${age} years` : 'Less than 1 year';
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  const { id } = req.query;

  try {
    const { data, error } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointID, AppointDateCreated, AppointSchedDate, AppointStatus, ServID,
        USERPETS!APPOINTMENT_UserPetID_fkey (
          UserPetID,
          USER ( UserID, UserName, UserAddress, ACCOUNT ( AccPhoneNum ) ),
          PET ( PetID, PetName, PetBreed, PetSpecie, PetGender, PetMarkings, PetBDay )
        ),
        SERVICES!APPOINTMENT_ServID_fkey ( ServID, ServType )
      `)
      .eq('AppointID', id)
      .single();

    if (error) throw error;

    const { data: medicalRecords } = await supabase
      .from('MEDICALHISTORY')
      .select('MedID, Medicine, Description, created_at')
      .eq('ServID', data.ServID)
      .order('created_at', { ascending: false });

    res.json({
      id: data.AppointID,
      userId: data.USERPETS.USER.UserID,
      userName: data.USERPETS.USER.UserName,
      userPhone: data.USERPETS.USER.ACCOUNT.AccPhoneNum || 'N/A',
      userAddress: data.USERPETS.USER.UserAddress || 'N/A',
      date: new Date(data.AppointSchedDate).toISOString().split('T')[0],
      type: data.SERVICES.ServType,
      serviceType: data.SERVICES.ServType,
      status: data.AppointStatus.toLowerCase(),
      pets: [{
        id: data.USERPETS.PET.PetID, name: data.USERPETS.PET.PetName,
        breed: data.USERPETS.PET.PetBreed, species: data.USERPETS.PET.PetSpecie,
        gender: data.USERPETS.PET.PetGender, markings: data.USERPETS.PET.PetMarkings,
        age: calculateAge(data.USERPETS.PET.PetBDay),
      }],
      medicalRecords: (medicalRecords || []).map(r => ({ id: r.MedID, medicine: r.Medicine, description: r.Description, date: r.created_at })),
      createdAt: data.AppointDateCreated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
