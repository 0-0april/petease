import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, googleId, avatar } = req.body;

  try {
    const { data: existingAccount } = await supabase
      .from('ACCOUNT')
      .select('*')
      .eq('AccEmail', email)
      .single();

    let accId, role, userData;

    if (existingAccount) {
      if (existingAccount.AccStatus === 'Suspended') {
        return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
      }

      accId = existingAccount.AccID;

      const { data: admins } = await supabase.from('ADMIN').select('*').eq('AccID', accId).single();
      if (admins) {
        role = 'admin'; userData = admins;
      } else {
        const { data: vets } = await supabase.from('VETSTAFF').select('*').eq('AccID', accId).single();
        if (vets) {
          role = 'vet'; userData = vets;
        } else {
          const { data: users } = await supabase.from('USER').select('*').eq('AccID', accId).single();
          if (users) { role = 'user'; userData = users; }
        }
      }
    } else {
      const username = email.split('@')[0];
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const { data: newAccount, error: accountError } = await supabase
        .from('ACCOUNT')
        .insert({ AccUserName: username, AccEmail: email, AccPass: hashedPassword })
        .select()
        .single();

      if (accountError) throw accountError;

      accId = newAccount.AccID;
      role = 'user';

      const { error: userError } = await supabase
        .from('USER')
        .insert({ UserName: name, AccID: accId });
      if (userError) throw userError;

      const { data: newUser } = await supabase.from('USER').select('*').eq('AccID', accId).single();
      userData = newUser;
    }

    const token = jwt.sign({ accId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        accId,
        email,
        role,
        accStatus: existingAccount?.AccStatus || 'Active',
        ...userData,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: error.message });
  }
}
