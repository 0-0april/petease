const { supabase } = require('./supabase');

async function createNotification({ accId, title, message, type }) {
  if (!accId || !title || !message) return null;
  const { data, error } = await supabase
    .from('NOTIFICATION')
    .insert({ AccID: accId, NotifTitle: title, NotifMessage: message, NotifType: type })
    .select().single();
  if (error) { console.error('Create notification error:', error); return null; }
  return data;
}

async function createNotificationsForUsers({ title, message, type }) {
  const { data: users, error } = await supabase.from('USER').select('AccID');
  if (error) { console.error('Fetch users error:', error); return []; }
  const rows = (users || []).filter(u => u.AccID)
    .map(u => ({ AccID: u.AccID, NotifTitle: title, NotifMessage: message, NotifType: type }));
  if (!rows.length) return [];
  const { data, error: insertError } = await supabase.from('NOTIFICATION').insert(rows).select();
  if (insertError) { console.error('Create user notifications error:', insertError); return []; }
  return data;
}

async function createNotificationsForVets({ title, message, type }) {
  const { data: vets, error } = await supabase.from('VETSTAFF').select('AccID');
  if (error) { console.error('Fetch vets error:', error); return []; }
  const rows = (vets || []).filter(v => v.AccID)
    .map(v => ({ AccID: v.AccID, NotifTitle: title, NotifMessage: message, NotifType: type }));
  if (!rows.length) return [];
  const { data, error: insertError } = await supabase.from('NOTIFICATION').insert(rows).select();
  if (insertError) { console.error('Create vet notifications error:', insertError); return []; }
  return data;
}

module.exports = { createNotification, createNotificationsForUsers, createNotificationsForVets };
