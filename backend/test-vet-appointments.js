import { supabase } from './config/supabase.js';

async function testVetAppointments() {
  console.log('🧪 Testing Vet Appointments...\n');

  try {
    // Test 1: Fetch all appointments
    console.log('📋 Test 1: Fetching all appointments with logs...');
    const { data: appointments, error } = await supabase
      .from('APPOINTMENT')
      .select(`
        AppointID,
        AppointStatus,
        AppointSchedDate,
        APPOINTMENTLOGS (
          LogID,
          LogAttendance,
          LogNote,
          created_at
        )
      `)
      .order('AppointDateCreated', { ascending: false })
      .limit(5);

    if (error) throw error;

    console.log(`✅ Found ${appointments.length} appointments\n`);

    appointments.forEach(apt => {
      const logs = apt.APPOINTMENTLOGS || [];
      const attendedLog = logs.find(log => log.LogAttendance === true);
      
      console.log(`📌 Appointment: ${apt.AppointID}`);
      console.log(`   Status: ${apt.AppointStatus}`);
      console.log(`   Date: ${apt.AppointSchedDate}`);
      console.log(`   Logs: ${logs.length}`);
      console.log(`   Attended: ${attendedLog ? 'YES ✅' : logs.length > 0 ? 'NO ❌' : 'Not marked yet'}`);
      
      if (logs.length > 0) {
        logs.forEach(log => {
          console.log(`      - LogAttendance: ${log.LogAttendance}, Note: ${log.LogNote}`);
        });
      }
      console.log('');
    });

    // Test 2: Count by status
    console.log('\n📊 Test 2: Count appointments by status...');
    const { data: pending } = await supabase
      .from('APPOINTMENT')
      .select('AppointID', { count: 'exact', head: true })
      .eq('AppointStatus', 'Pending');

    const { data: confirmed } = await supabase
      .from('APPOINTMENT')
      .select('AppointID', { count: 'exact', head: true })
      .eq('AppointStatus', 'Confirmed');

    console.log(`   Pending: ${pending?.length || 0}`);
    console.log(`   Confirmed: ${confirmed?.length || 0}`);

    // Test 3: Count completed (with attendance logs)
    const { data: withLogs } = await supabase
      .from('APPOINTMENTLOGS')
      .select('AppointID, LogAttendance')
      .eq('LogAttendance', true);

    console.log(`   Completed (attended): ${withLogs?.length || 0}`);

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVetAppointments();
