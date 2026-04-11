import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, phoneNum, password, name, address, role = 'user' } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data: accountData, error: accountError } = await supabase
      .from('ACCOUNT')
      .insert({
        AccUserName: username,
        AccEmail: email,
        AccPhoneNum: phoneNum,
        AccPass: hashedPassword
      })
      .select()
      .single();

    if (accountError) throw accountError;

    const accId = accountData.AccID;

    if (role === 'user') {
      const { error: userError } = await supabase
        .from('USER')
        .insert({
          UserName: name,
          AccID: accId,
          UserAddress: address
        });

      if (userError) throw userError;
    }

    const token = jwt.sign({ accId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { accId, username, email, name, role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: accounts, error: accountError } = await supabase
      .from('ACCOUNT')
      .select('*')
      .eq('AccEmail', email)
      .single();

    if (accountError || !accounts) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const account = accounts;
    const isValidPassword = await bcrypt.compare(password, account.AccPass);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let role = 'user';
    let userData = null;

    const { data: users } = await supabase
      .from('USER')
      .select('*')
      .eq('AccID', account.AccID)
      .single();

    if (users) {
      role = 'user';
      userData = users;
    } else {
      const { data: admins } = await supabase
        .from('ADMIN')
        .select('*')
        .eq('AccID', account.AccID)
        .single();

      if (admins) {
        role = 'admin';
        userData = admins;
      } else {
        const { data: vets } = await supabase
          .from('VETSTAFF')
          .select('*')
          .eq('AccID', account.AccID)
          .single();

        if (vets) {
          role = 'vet';
          userData = vets;
        }
      }
    }

    const token = jwt.sign({ accId: account.AccID, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        accId: account.AccID,
        username: account.AccUserName,
        email: account.AccEmail,
        role,
        ...userData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
