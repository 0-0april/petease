import { supabase } from './config/supabase.js';

async function checkEnums() {
  console.log('🔍 Checking enum values in database...\n');

  // Query to get enum values from PostgreSQL
  const { data, error } = await supabase.rpc('get_enum_values', {
    enum_name: 'adopt_status'
  });

  if (error) {
    console.log('⚠️ RPC function not available, trying direct query...');
    
    // Alternative: Try to get a sample record to see what values exist
    const { data: adoptions, error: adoptError } = await supabase
      .from('ADOPTION')
      .select('AdoptStatus')
      .limit(10);

    if (adoptError) {
      console.error('❌ Error:', adoptError);
    } else {
      console.log('📋 Sample AdoptStatus values found in database:');
      const uniqueStatuses = [...new Set(adoptions.map(a => a.AdoptStatus))];
      uniqueStatuses.forEach(status => console.log(`  - ${status}`));
    }
  } else {
    console.log('✅ Enum values for adopt_status:');
    data.forEach(value => console.log(`  - ${value}`));
  }

  console.log('\n💡 To see all enum types in your database, run this SQL in Supabase SQL Editor:');
  console.log(`
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'adopt_status'
ORDER BY e.enumsortorder;
  `);

  process.exit(0);
}

checkEnums();
