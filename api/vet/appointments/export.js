import { supabase } from '../../_lib/supabase.js';
import { getUserWithRole } from '../../_lib/auth.js';

const calculateAge = (birthday) => {
  if (!birthday) return 'N/A';
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age > 0 ? `${age} years` : 'Less than 1 year';
};

const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'vet');
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointID, AppointSchedDate, AppointStatus, CancellationReason, created_at,
        USERPETS!APPOINTMENT_UserPetID_fkey (
          USER ( UserName, UserAddress, ACCOUNT ( AccEmail, AccPhoneNum ) ),
          PET ( PetID, PetName, PetSpecie, PetMarkings, PetGender, PetBDay )
        ),
        SERVICES!APPOINTMENT_ServID_fkey ( ServType, ServID ),
        APPOINTMENTLOGS ( LogID, LogAttendance, LogNote, created_at, ACCOUNT ( AccUserName ) )
      `)
      .order('AppointSchedDate', { ascending: false });

    if (error) throw error;

    const servIds = [...new Set(data.map(a => a.SERVICES?.ServID).filter(Boolean))];
    let medicalByServ = {};
    if (servIds.length) {
      const { data: medData } = await supabase
        .from('MEDICALHISTORY').select('Medicine, Description, ServID, created_at').in('ServID', servIds);
      for (const m of medData || []) {
        if (!medicalByServ[m.ServID]) medicalByServ[m.ServID] = [];
        medicalByServ[m.ServID].push(`${m.Medicine}: ${m.Description || ''} (${new Date(m.created_at).toLocaleDateString()})`);
      }
    }

    const headers = ['Scheduled Date','Service','Status','Patient Name','Phone Number','Email','Pet Name','Species','Markings','Pet Gender','Age','Medical Records','Activity Log'];

    const rows = data.map(apt => {
      const pet = apt.USERPETS?.PET || {};
      const user = apt.USERPETS?.USER || {};
      const account = user.ACCOUNT || {};
      const servId = apt.SERVICES?.ServID;
      const medRecords = medicalByServ[servId]?.join(' | ') || 'None';
      const logs = (apt.APPOINTMENTLOGS || [])
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(l => {
          const action = l.LogAttendance === true ? 'Attended' : l.LogAttendance === false ? 'No Show' : 'Updated';
          return `[${new Date(l.created_at).toLocaleString()}] ${action} by ${l.ACCOUNT?.AccUserName || 'System'}${l.LogNote ? ': ' + l.LogNote : ''}`;
        }).join(' | ') || 'None';

      return [apt.AppointSchedDate?.split('T')[0]||'N/A', apt.SERVICES?.ServType||'N/A', apt.AppointStatus||'N/A',
        user.UserName||'N/A', account.AccPhoneNum||'N/A', account.AccEmail||'N/A',
        pet.PetName||'N/A', pet.PetSpecie||'N/A', pet.PetMarkings||'N/A',
        pet.PetGender||'N/A', calculateAge(pet.PetBDay), medRecords, logs,
      ].map(escape).join(',');
    });

    const csv = [headers.map(escape).join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="appointments-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
