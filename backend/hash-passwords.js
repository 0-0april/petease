import bcrypt from 'bcryptjs';
import { supabase } from './config/supabase.js';

async function hashPasswords() {
  try {
    console.log('Hashing passwords for test accounts...');
    
    // Hash the passwords
    const password1 = await bcrypt.hash('password123', 10);
    const password2 = await bcrypt.hash('password123', 10);
    const password3 = await bcrypt.hash('admin123', 10);
    const password4 = await bcrypt.hash('vet123', 10);
    
    // Update juan_dela_cruz
    const { error: error1 } = await supabase
      .from('ACCOUNT')
      .update({ AccPass: password1 })
      .eq('AccEmail', 'juan@email.com');
    
    if (error1) console.error('Error updating juan:', error1);
    else console.log('✓ Updated juan@email.com (password: password123)');
    
    // Update maria_santos
    const { error: error2 } = await supabase
      .from('ACCOUNT')
      .update({ AccPass: password2 })
      .eq('AccEmail', 'maria@email.com');
    
    if (error2) console.error('Error updating maria:', error2);
    else console.log('✓ Updated maria@email.com (password: password123)');
    
    // Update admin_rosa
    const { error: error3 } = await supabase
      .from('ACCOUNT')
      .update({ AccPass: password3 })
      .eq('AccEmail', 'rosa@shelter.com');
    
    if (error3) console.error('Error updating admin:', error3);
    else console.log('✓ Updated rosa@shelter.com (password: admin123)');
    
    // Update vet_dra_santos
    const { error: error4 } = await supabase
      .from('ACCOUNT')
      .update({ AccPass: password4 })
      .eq('AccEmail', 'dra.santos@shelter.com');
    
    if (error4) console.error('Error updating vet:', error4);
    else console.log('✓ Updated dra.santos@shelter.com (password: vet123)');
    
    console.log('\nAll passwords updated successfully!');
    console.log('\nTest credentials:');
    console.log('User: juan@email.com / password123');
    console.log('User: maria@email.com / password123');
    console.log('Admin: rosa@shelter.com / admin123');
    console.log('Vet: dra.santos@shelter.com / vet123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

hashPasswords();
