const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;

  try {
    const { data: account, error: accountError } = await supabase
      .from('ACCOUNT').select('*').eq('AccEmail', email).single();

    if (accountError || !account) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, account.AccPass);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    if (account.AccStatus === 'Suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    let role = 'user';
    let userData = null;

    const { data: admin } = await supabase.from('ADMIN').select('*').eq('AccID', account.AccID).single();
    if (admin) {
      role = 'admin'; userData = admin;
    } else {
      const { data: vet } = await supabase.from('VETSTAFF').select('*').eq('AccID', account.AccID).single();
      if (vet) {
        role = 'vet'; userData = vet;
      } else {
        const { data: user } = await supabase.from('USER').select('*').eq('AccID', account.AccID).single();
        if (user) {
          role = 'user'; userData = user;
          await supabase.from('USER').update({ UserLastLogin: new Date().toISOString() }).eq('AccID', account.AccID);
        }
      }
    }

    const token = jwt.sign({ accId: account.AccID, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { accId: account.AccID, username: account.AccUserName, email: account.AccEmail, role, accStatus: account.AccStatus || 'Active', UserID: userData?.UserID, ...userData },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};
