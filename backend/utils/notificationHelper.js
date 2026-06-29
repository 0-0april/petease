import { supabase } from '../config/supabase.js';

export const createNotification = async ({ accId, title, message, type }) => {
  if (!accId || !title || !message) return null;

  const { data, error } = await supabase
    .from('NOTIFICATION')
    .insert({
      AccID: accId,
      NotifTitle: title,
      NotifMessage: message,
      NotifType: type
    })
    .select()
    .single();

  if (error) {
    console.error('Create notification error:', error);
    return null;
  }

  return data;
};

export const createNotificationsForUsers = async ({ title, message, type }) => {
  const { data: users, error: usersError } = await supabase
    .from('USER')
    .select('AccID');

  if (usersError) {
    console.error('Fetch notification users error:', usersError);
    return [];
  }

  const rows = users
    .filter(user => user.AccID)
    .map(user => ({
      AccID: user.AccID,
      NotifTitle: title,
      NotifMessage: message,
      NotifType: type
    }));

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from('NOTIFICATION')
    .insert(rows)
    .select();

  if (error) {
    console.error('Create user notifications error:', error);
    return [];
  }

  return data;
};

// Notify all vet staff accounts
export const createNotificationsForVets = async ({ title, message, type }) => {
  const { data: vetAccounts, error } = await supabase
    .from('VETSTAFF')
    .select('AccID');

  if (error) {
    console.error('Fetch vet accounts error:', error);
    return [];
  }

  const rows = (vetAccounts || [])
    .filter(v => v.AccID)
    .map(v => ({
      AccID: v.AccID,
      NotifTitle: title,
      NotifMessage: message,
      NotifType: type
    }));

  if (rows.length === 0) return [];

  const { data, error: insertError } = await supabase
    .from('NOTIFICATION')
    .insert(rows)
    .select();

  if (insertError) {
    console.error('Create vet notifications error:', insertError);
    return [];
  }

  return data;
};
