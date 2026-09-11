import { supabase } from '../../_lib/supabase.js';
import { getUserWithRole } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointID, AppointDateCreated, AppointSchedDate, AppointStatus,
        USERPETS!APPOINTMENT_UserPetID_fkey (
          UserPetID,
          USER ( UserID, UserName, ACCOUNT ( AccPhoneNum ) ),
          PET ( PetID, PetName, PetBreed, PetSpecie )
        ),
        SERVICES!APPOINTMENT_ServID_fkey ( ServID, ServType ),
        APPOINTMENTLOGS ( LogID, LogAttendance, created_at )
      `, { count: 'exact' })
      .order('AppointDateCreated', { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    if (error) throw error;

    const appointments = data.map(apt => {
      const attendanceLogs = apt.APPOINTMENTLOGS || [];
      const attendedLog = attendanceLogs.find(l => l.LogAttendance === true);
      return {
        id: apt.AppointID,
        userId: apt.USERPETS.USER.UserID,
        userName: apt.USERPETS.USER.UserName,
        userPhone: apt.USERPETS.USER.ACCOUNT.AccPhoneNum || 'N/A',
        date: new Date(apt.AppointSchedDate).toISOString().split('T')[0],
        type: apt.SERVICES.ServType,
        serviceType: apt.SERVICES.ServType,
        status: apt.AppointStatus.toLowerCase(),
        pets: [{ id: apt.USERPETS.PET.PetID, name: apt.USERPETS.PET.PetName, breed: apt.USERPETS.PET.PetBreed, species: apt.USERPETS.PET.PetSpecie }],
        attended: attendedLog ? true : (attendanceLogs.length > 0 ? false : null),
        createdAt: apt.AppointDateCreated,
        notes: '',
      };
    });

    res.json({ appointments, total: count, page, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
