import { useState, useEffect } from 'react';
import { getClientSupabase } from '@/app/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Profile } from '@/app/types';

interface UserData {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUser() {
  const [userData, setUserData] = useState<UserData>({
    user: null,
    profile: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Get the initial user state
    const fetchUser = async () => {
      try {
        const supabase = getClientSupabase();
        if (!supabase) {
          setUserData({
            user: null,
            profile: null,
            isLoading: false,
            error: new Error('Failed to connect to authentication service')
          });
          return;
        }
        
        // Get current auth state
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (user) {
          // Also fetch the user's profile data if they're logged in
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') { // 'PGRST116' = not found
            console.error('Error fetching profile:', profileError);
          }
          
          setUserData({
            user,
            profile: profile || null,
            isLoading: false,
            error: null
          });
        } else {
          setUserData({
            user: null,
            profile: null,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUserData({
          user: null,
          profile: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error')
        });
      }
    };

    fetchUser();

    // Get Supabase client for auth state subscription
    const supabase = getClientSupabase();
    if (!supabase) {
      setUserData(prev => ({
        ...prev,
        isLoading: false,
        error: new Error('Failed to connect to authentication service')
      }));
      return;
    }
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Reload the user data when they sign in
          fetchUser();
        } else if (event === 'SIGNED_OUT') {
          // Clear the user data when they sign out
          setUserData({
            user: null,
            profile: null,
            isLoading: false,
            error: null
          });
        }
      }
    );

    // Unsubscribe on cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return userData;
} 