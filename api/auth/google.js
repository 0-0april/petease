const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name } = req.body;

  try {
    const { data: existingAccount } = await supabase.from('ACCOUNT').select('*').eq('AccEmail', email).single();

    let accId, role, userData;

    if (existingAccount) {
      if (existingAccount.AccStatus === 'Suspended') {
        return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
      }
      accId = existingAccount.AccID;

      const { data: admin } = await supabase.from('ADMIN').select('*').eq('AccID', accId).single();
      if (admin) { role = 'admin'; userData = admin; }
      else {
        const { data: vet } = await supabase.from('VETSTAFF').select('*').eq('AccID', accId).single();
        if (vet) { role = 'vet'; userData = vet; }
        else {
          const { data: user } = await supabase.from('USER').select('*').eq('AccID', accId).single();
          if (user) { role = 'user'; userData = user; }
        }
      }
    } else {
      const username = email.split('@')[0];
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
      const { data: newAccount, error: accountError } = await supabase
        .from('ACCOUNT').insert({ AccUserName: username, AccEmail: email, AccPass: hashedPassword }).select().single();
      if (accountError) throw accountError;

      accId = newAccount.AccID;
      role = 'user';
      await supabase.from('USER').insert({ UserName: name, AccID: accId });
      const { data: newUser } = await supabase.from('USER').select('*').eq('AccID', accId).single();
      userData = newUser;
    }

    const token = jwt.sign({ accId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { accId, email, role, accStatus: existingAccount?.AccStatus || 'Active', ...userData } });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: error.message });
  }
};
