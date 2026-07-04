// Auth Service Layer Adapter
// Connects directly to the live Supabase Auth client.

import { supabase } from '../../lib/supabaseClient';

/**
 * Self-healing helper: Ensures a public profile entry exists for the logged-in Auth user.
 * Dynamically recreates the profile row if the database tables were cleared.
 */
const ensureUserProfileExists = async (user) => {
  if (!user) return null;

  try {
    // Try to fetch profile from public.users
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) return profile;

    // Profile is missing, insert it dynamically
    const defaultRole = user.raw_user_meta_data?.role || 'creator';
    const name = user.raw_user_meta_data?.name || user.email.split('@')[0];

    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        name,
        email: user.email,
        role: defaultRole
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Failed to auto-create user profile during authentication', insertError);
      // Fallback: try to read profile again in case of race condition or custom backend constraints
      const { data: retryProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      return retryProfile || null;
    }

    return newProfile;
  } catch (err) {
    console.error('Exception inside ensureUserProfileExists', err);
    return null;
  }
};

export const AuthService = {
  signIn: async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (authError) throw authError;

    // Ensure the public profile exists on login
    const profile = await ensureUserProfileExists(authData.user);
    if (!profile) throw new Error('Failed to synchronize user profile.');

    return { session: authData.session, user: profile };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) return null;

    const profile = await ensureUserProfileExists(session.user);
    if (!profile) return null;

    return { session, user: profile };
  },

  onAuthStateChange: (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const profile = await ensureUserProfileExists(session.user);
        callback(event, { session, user: profile });
      } else {
        callback(event, null);
      }
    });
    return () => subscription.unsubscribe();
  }
};

export default AuthService;
