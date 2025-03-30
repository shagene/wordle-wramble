'use client';

import { useState, useEffect, useCallback } from 'react';
import { getClientSupabase } from '../lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { Profile, SubscriptionTier } from '@/app/types';
import { ensureUserProfile, getUserProfile } from '@/app/services/authService';

interface UseSupabaseAuthReturn {
  user: Profile | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  subscriptionTier: SubscriptionTier;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useSupabaseAuth(): UseSupabaseAuthReturn {
  console.log('useSupabaseAuth: Hook initialization');
  
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get the client instance lazily
  const supabase = getClientSupabase();

  // Function to fetch the user profile
  const fetchUserProfile = useCallback(async (userId: string, email: string = '') => {
    console.log('useSupabaseAuth: fetchUserProfile called for userId:', userId);
    
    try {
      // First try to get the existing profile
      console.log('useSupabaseAuth: Attempting to get existing profile');
      const { data: existingProfile, error: getError } = await getUserProfile(userId);
      
      if (existingProfile) {
        console.log('useSupabaseAuth: Profile found:', existingProfile.id);
        setUser(existingProfile);
        setError(null);
        return true;
      }
      
      // Only create a new profile if we got a specific "not found" error
      if (getError && typeof getError === 'object' && 'code' in getError && getError.code === 'PGRST116') {
        console.log('useSupabaseAuth: Profile not found, creating new one');
        const { data: newProfile, error: createError } = await ensureUserProfile(
          userId,
          email
        );
        
        if (createError) {
          // If we get a duplicate key error, try fetching the profile one more time
          if (typeof createError === 'object' && 'code' in createError && createError.code === '23505') { // PostgreSQL unique violation code
            console.log('useSupabaseAuth: Duplicate key error, retrying profile fetch');
            const { data: retryProfile } = await getUserProfile(userId);
            if (retryProfile) {
              console.log('useSupabaseAuth: Profile found on retry');
              setUser(retryProfile);
              setError(null);
              return true;
            }
          }
          console.error('useSupabaseAuth: Failed to create profile:', createError);
          throw new Error(`Failed to create profile: ${createError instanceof Error ? createError.message : String(createError)}`);
        }
        
        if (newProfile) {
          console.log('useSupabaseAuth: New profile created:', newProfile.id);
          setUser(newProfile);
          setError(null);
          return true;
        }
      } else if (getError) {
        // Some other error occurred during profile fetch
        console.error('useSupabaseAuth: Error fetching profile:', getError);
        throw new Error(`Error fetching profile: ${getError instanceof Error ? getError.message : String(getError)}`);
      }
      
      // If we get here, something went wrong
      console.error('useSupabaseAuth: Failed to get or create user profile');
      throw new Error('Failed to get or create user profile');
    } catch (err) {
      console.error('useSupabaseAuth: Error in fetchUserProfile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
      setUser(null);
      return false;
    }
  }, []);

  // Function to refresh the auth state
  const refresh = useCallback(async () => {
    console.log('useSupabaseAuth: refresh() called');
    setIsLoading(true);
    setError(null);
    
    // Ensure client is available before proceeding
    if (!supabase) {
      console.error("useSupabaseAuth: Supabase client not available during refresh.");
      setError(new Error("Supabase client not initialized"));
      setIsLoading(false);
      return;
    }
    
    try {
      // Get the current session
      console.log('useSupabaseAuth: Getting current session');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('useSupabaseAuth: Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        console.log('useSupabaseAuth: No session found, setting user to null');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      console.log('useSupabaseAuth: Session found, fetching profile for user:', session.user.id);
      const success = await fetchUserProfile(session.user.id, session.user.email || '');
      
      if (!success && retryCount < 3) {
        console.log(`useSupabaseAuth: Retrying profile fetch (attempt ${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(refresh, 1000); // Retry after a short delay
      } else if (!success) {
        console.error('useSupabaseAuth: Failed to fetch profile after retries');
      }
    } catch (err) {
      console.error('useSupabaseAuth: Error in refresh:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh auth state'));
      setUser(null);
    } finally {
      console.log('useSupabaseAuth: Refresh completed, setting isLoading to false');
      setIsLoading(false);
    }
  }, [retryCount, fetchUserProfile, supabase]);

  useEffect(() => {
    console.log('useSupabaseAuth: Initial useEffect triggered');
    
    // Ensure client is available before proceeding
    if (!supabase) {
      console.error("useSupabaseAuth: Supabase client not available in useEffect.");
      setError(new Error("Supabase client not initialized"));
      setIsLoading(false);
      return;
    }
    
    // Initial fetch
    refresh();

    // Set up subscription for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      console.log('useSupabaseAuth: Auth state changed, triggering refresh');
      refresh();
    });

    // Clean up subscription
    return () => {
      console.log('useSupabaseAuth: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [refresh, supabase]);

  const result = {
    user,
    userId: user?.id || null,
    isLoading,
    isAuthenticated: !!user,
    subscriptionTier: (user?.subscription_tier as SubscriptionTier) || 'free',
    error,
    refresh
  };
  
  console.log('useSupabaseAuth: Returning state:', {
    userId: result.userId,
    isLoading: result.isLoading,
    isAuthenticated: result.isAuthenticated,
    hasError: !!result.error
  });
  
  return result;
} 