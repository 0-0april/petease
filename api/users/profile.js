import { supabase } from '../_lib/supabase.js';
import { getUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('USER')
      .select('*, ACCOUNT ( AccUserName, AccEmail, AccPhoneNum )')
      .eq('AccID', user.accId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'User not found' });

    res.json({
      ...data,
      AccUserName: data.ACCOUNT?.AccUserName,
      AccEmail: data.ACCOUNT?.AccEmail,
      AccPhoneNum: data.ACCOUNT?.AccPhoneNum,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
