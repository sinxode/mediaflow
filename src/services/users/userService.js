// User Service Layer Adapter
// Connects directly to the live Supabase database.

import { supabase } from '../../lib/supabaseClient';

export const UserService = {
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  updateUserProfile: async (userId, profileData) => {
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  }
};

export default UserService;
