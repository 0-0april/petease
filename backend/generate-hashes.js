import bcrypt from 'bcryptjs';

async function generateHashes() {
  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('admin123', 10);
  const password3 = await bcrypt.hash('vet123', 10);
  
  console.log('Generated bcrypt hashes:\n');
  console.log('password123:', password1);
  console.log('admin123:', password2);
  console.log('vet123:', password3);
  
  console.log('\n\nSQL to run in Supabase:');
  console.log(`
-- Update passwords with bcrypt hashes
UPDATE "ACCOUNT" SET "AccPass" = '${password1}' WHERE "AccEmail" = 'juan@email.com';
UPDATE "ACCOUNT" SET "AccPass" = '${password1}' WHERE "AccEmail" = 'maria@email.com';
UPDATE "ACCOUNT" SET "AccPass" = '${password2}' WHERE "AccEmail" = 'rosa@shelter.com';
UPDATE "ACCOUNT" SET "AccPass" = '${password3}' WHERE "AccEmail" = 'dra.santos@shelter.com';
  `);
}

generateHashes();
