import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, email, phoneNum, password, name, address, role = 'user' } = req.body;

  try {
    const { data: existing } = await supabase
      .from('ACCOUNT')
      .select('AccStatus')
      .eq('AccEmail', email)
      .single();

    if (existing?.AccStatus === 'Suspended') {
      return res.status(403).json({ error: 'This email is associated with a suspended account.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: accountData, error: accountError } = await supabase
      .from('ACCOUNT')
      .insert({ AccUserName: username, AccEmail: email, AccPhoneNum: phoneNum, AccPass: hashedPassword })
      .select()
      .single();

    if (accountError) throw accountError;

    const accId = accountData.AccID;

    if (role === 'user') {
      const { error: userError } = await supabase
        .from('USER')
        .insert({ UserName: name, AccID: accId, UserAddress: address });
      if (userError) throw userError;
    }

    const token = jwt.sign({ accId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { accId, username, email, name, role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
