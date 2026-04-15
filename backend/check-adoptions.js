import { supabase } from './config/supabase.js';

async function checkAdoptions() {
  console.log('🔍 Checking adoptions in database...\n');

  // Get all adoptions
  const { data: allAdoptions, error: allError } = await supabase
    .from('ADOPTION')
    .select('AdoptID, AdoptStatus, AdoptReqDate')
    .order('AdoptReqDate', { ascending: false });

  if (allError) {
    console.error('❌ Error fetching adoptions:', allError);
    process.exit(1);
  }

  console.log(`📋 Total adoptions in database: ${allAdoptions.length}\n`);

  if (allAdoptions.length === 0) {
    console.log('⚠️ No adoptions found in database!');
    console.log('💡 You need to create some adoption requests first.');
  } else {
    // Group by status
    const byStatus = {};
    allAdoptions.forEach(adoption => {
      const status = adoption.AdoptStatus;
      if (!byStatus[status]) byStatus[status] = [];
      byStatus[status].push(adoption);
    });

    console.log('📊 Adoptions by status:');
    Object.keys(byStatus).forEach(status => {
      console.log(`  ${status}: ${byStatus[status].length}`);
    });

    console.log('\n📝 Sample adoptions:');
    allAdoptions.slice(0, 5).forEach(adoption => {
      console.log(`  - ID: ${adoption.AdoptID.substring(0, 8)}... | Status: ${adoption.AdoptStatus} | Date: ${adoption.AdoptReqDate}`);
    });

    // Check approved specifically
    const approved = allAdoptions.filter(a => a.AdoptStatus === 'Approved');
    console.log(`\n✅ Approved adoptions: ${approved.length}`);
    
    if (approved.length === 0) {
      console.log('\n💡 No approved adoptions found!');
      console.log('To test the vet adoptions page, you need to:');
      console.log('1. Create an adoption request as a user');
      console.log('2. Approve it as the pet owner');
      console.log('3. Then it will appear in the vet adoptions page');
    }
  }

  process.exit(0);
}

checkAdoptions();
