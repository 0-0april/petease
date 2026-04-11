import { supabase } from './config/supabase.js';
import bcrypt from 'bcryptjs';

async function testLogin() {
  try {
    console.log('Testing login flow...\n');
    
    // Test 1: Check if we can query the ACCOUNT table
    console.log('1. Querying ACCOUNT table for juan@email.com...');
    const { data: account, error: accountError } = await supabase
      .from('ACCOUNT')
      .select('*')
      .eq('AccEmail', 'juan@email.com')
      .single();
    
    if (accountError) {
      console.error('❌ Error querying account:', accountError);
      return;
    }
    
    if (!account) {
      console.error('❌ No account found');
      return;
    }
    
    console.log('✓ Account found:', {
      AccID: account.AccID,
      AccUserName: account.AccUserName,
      AccEmail: account.AccEmail,
      AccPass: account.AccPass.substring(0, 20) + '...'
    });
    
    // Test 2: Check password format
    console.log('\n2. Checking password format...');
    if (account.AccPass.startsWith('$2a$') || account.AccPass.startsWith('$2b$')) {
      console.log('✓ Password is bcrypt hashed');
      
      // Test 3: Try comparing with test password
      console.log('\n3. Testing password comparison...');
      const isValid = await bcrypt.compare('password123', account.AccPass);
      console.log('Password "password123" matches:', isValid ? '✓ YES' : '❌ NO');
      
    } else {
      console.log('❌ Password is NOT bcrypt hashed');
      console.log('Current password value:', account.AccPass);
      console.log('\n⚠️  You need to run the SQL update script to hash the passwords!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
