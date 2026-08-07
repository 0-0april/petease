import bcrypt from 'bcryptjs';
import { supabase } from './config/supabase.js';

// ── Configure these two values ───────────────────────────────────────────────
const TARGET_EMAIL   = 'juan@email.com';   // account email to reset
const NEW_PASSWORD   = 'newpassword123';   // new plain-text password
// ─────────────────────────────────────────────────────────────────────────────

async function resetPassword() {
  try {
    console.log(`Resetting password for: ${TARGET_EMAIL}`);

    // 1. Check account exists
    const { data: account, error: fetchError } = await supabase
      .from('ACCOUNT')
      .select('AccID, AccEmail')
      .eq('AccEmail', TARGET_EMAIL)
      .single();

    if (fetchError || !account) {
      console.error('Account not found:', fetchError?.message ?? 'no record');
      process.exit(1);
    }

    // 2. Hash the new password
    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

    // 3. Update in DB
    const { error: updateError } = await supabase
      .from('ACCOUNT')
      .update({ AccPass: hashed })
      .eq('AccEmail', TARGET_EMAIL);

    if (updateError) {
      console.error('Failed to update password:', updateError.message);
      process.exit(1);
    }

    console.log(`✓ Password reset successfully!`);
    console.log(`  Email    : ${TARGET_EMAIL}`);
    console.log(`  Password : ${NEW_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

resetPassword();
