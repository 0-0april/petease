import { supabase } from './config/supabase.js';
import bcrypt from 'bcryptjs';

async function updatePasswords() {
  try {
    console.log('Updating passwords in database...\n');
    
    // Generate hashes
    const password1 = await bcrypt.hash('password123', 10);
    const password2 = await bcrypt.hash('admin123', 10);
    const password3 = await bcrypt.hash('vet123', 10);
    
    // Update juan@email.com
    const { error: error1 } = await supabase
      .from('ACCOUNT')
      .update({ AccPass: password1 })
      .eq('AccEmail', 'juan@email.com');
    
    if (error1) console.error('❌ Error updating juan:', error1.message);
    else console.log('✓ Updated juan@email.com (password: password123)');
    
    // Update maria@email.com
    const { error: error2 } = await supabase
      .from('ACCOUNT')
      .update({ AccPass: password1 })
      .eq('AccEmail', 'maria@email.com');
    
    if (error2) console.error('❌ Error updating maria:', error2.message);
    else console.log('✓ Updated maria@email.com (password: password123)');
    
    // Update rosa@shelter.com
    const { error: error3 } = await supabase
      .from('ACCOUNT')
      .update({ AccPass: password2 })
      .eq('AccEmail', 'rosa@shelter.com');
    
    if (error3) console.error('❌ Error updating admin:', error3.message);
    else console.log('✓ Updated rosa@shelter.com (password: admin123)');
    
    // Update dra.santos@shelter.com
    const { error: error4 } = await supabase
      .from('ACCOUNT')
      .update({ AccPass: password3 })
      .eq('AccEmail', 'dra.santos@shelter.com');
    
    if (error4) console.error('❌ Error updating vet:', error4.message);
    else console.log('✓ Updated dra.santos@shelter.com (password: vet123)');
    
    console.log('\n✅ All passwords updated successfully!');
    console.log('\nTest credentials:');
    console.log('User: juan@email.com / password123');
    console.log('User: maria@email.com / password123');
    console.log('Admin: rosa@shelter.com / admin123');
    console.log('Vet: dra.santos@shelter.com / vet123');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updatePasswords();
