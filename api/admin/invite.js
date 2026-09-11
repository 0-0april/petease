import bcrypt from 'bcryptjs';
import { supabase } from '../_lib/supabase.js';
import { getUserWithRole } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserWithRole(req, res, 'admin');
  if (!user) return;

  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, name, and role are required.' });
  }
  if (!['admin', 'vet'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin or vet.' });
  }

  try {
    const { data: existing } = await supabase.from('ACCOUNT').select('AccID').eq('AccEmail', email).single();
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0] + '_' + Math.random().toString(36).slice(-4);

    const { data: account, error: accError } = await supabase
      .from('ACCOUNT').insert({ AccUserName: username, AccEmail: email, AccPass: hashedPassword }).select().single();
    if (accError) throw accError;

    if (role === 'admin') {
      const { error } = await supabase.from('ADMIN').insert({ AdminName: name, AccID: account.AccID });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('VETSTAFF').insert({ StaffName: name, AccID: account.AccID });
      if (error) throw error;
    }

    res.status(201).json({ success: true, message: `${role === 'admin' ? 'Admin' : 'Vet Staff'} account created.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
