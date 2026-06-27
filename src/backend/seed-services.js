import { supabase } from './config/supabase.js';

async function seedServices() {
  console.log('🌱 Seeding services...');

  const services = [
    {
      ServType: 'Consultation',
      ServDayAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      ServSlot: 5,
      ServStatus: 'Active'
    },
    {
      ServType: 'Anti-Rabies Vaccination',
      ServDayAvailable: ['Monday', 'Wednesday', 'Friday'],
      ServSlot: 3,
      ServStatus: 'Active'
    },
    {
      ServType: 'Spay/Neuter',
      ServDayAvailable: ['Tuesday', 'Thursday'],
      ServSlot: 2,
      ServStatus: 'Active'
    }
  ];

  for (const service of services) {
    // Check if service already exists
    const { data: existing } = await supabase
      .from('SERVICES')
      .select('ServID')
      .eq('ServType', service.ServType)
      .single();

    if (existing) {
      console.log(`ℹ️  ${service.ServType} already exists, skipping...`);
      continue;
    }

    // Insert new service
    const { data, error } = await supabase
      .from('SERVICES')
      .insert(service)
      .select();

    if (error) {
      console.error(`❌ Error seeding ${service.ServType}:`, error);
    } else {
      console.log(`✅ Seeded ${service.ServType}`);
    }
  }

  console.log('🌱 Seeding complete!');
  process.exit(0);
}

seedServices();
