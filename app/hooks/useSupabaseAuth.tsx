'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { SubscriptionTier } from '../types';
import { getClientSupabase } from '../lib/supabase';

// Remove the direct client creation and use the centralized function instead
console.log('[useSupabaseAuth] Module initializing');

// Cache for auth state with a much longer TTL
const AUTH_CACHE = {
  user: null as User | null,
  userId: null as string | null,
  subscriptionTier: 'free' as SubscriptionTier,
  profileLoaded: false,
  lastChecked: 0,
  sessionExpiry: 0,
  // Session data
  session: null as Session | null
};

// Cache TTL in milliseconds (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

// Check localStorage for a persisted session on initial load
if (typeof window !== 'undefined') {
  try {
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (storedSession) {
      // If we have a persisted session, optimistically set hasSession
      AUTH_CACHE.lastChecked = Date.now();
    }
  } catch {
    // Ignore localStorage errors
  }
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(AUTH_CACHE.user);
  const [userId, setUserId] = useState<string | null>(AUTH_CACHE.userId);
  const [session, setSession] = useState<Session | null>(AUTH_CACHE.session);
  const [isLoading, setIsLoading] = useState<boolean>(!AUTH_CACHE.userId);
  const [error, setError] = useState<AuthError | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(AUTH_CACHE.subscriptionTier);

  // Function to check if cache is valid
  const isCacheValid = useCallback(() => {
    const now = Date.now();
    return (
      AUTH_CACHE.lastChecked > 0 &&
      now - AUTH_CACHE.lastChecked < CACHE_TTL &&
      (AUTH_CACHE.sessionExpiry === 0 || now < AUTH_CACHE.sessionExpiry)
    );
  }, []);

  // Initial setup and auth state listener
  useEffect(() => {
    console.log('useSupabaseAuth: Setting up auth state listener');
    
    // Get the Supabase client
    const supabase = getClientSupabase();
    
    // If no client is available, set an error and return
    if (!supabase) {
      console.error('useSupabaseAuth: Failed to initialize Supabase client');
      setError(new AuthError('Failed to initialize authentication service'));
      setIsLoading(false);
      return;
    }
    
    const checkAuth = async () => {
      try {
        // Use cached auth data if valid
        if (isCacheValid() && AUTH_CACHE.user) {
          console.log('useSupabaseAuth: Using cached auth data');
          setUser(AUTH_CACHE.user);
          setUserId(AUTH_CACHE.userId);
          setSession(AUTH_CACHE.session);
          setSubscriptionTier(AUTH_CACHE.subscriptionTier);
          setIsLoading(false);
          return;
        }

        // Otherwise, check session
        console.log('useSupabaseAuth: Fetching session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useSupabaseAuth: Session error', error);
          setError(error);
          setIsLoading(false);
          return;
        }
        
        const currentSession = data.session;
        console.log('useSupabaseAuth: Session check result:', !!currentSession);
        setSession(currentSession);
        AUTH_CACHE.session = currentSession;
        
        if (currentSession) {
          console.log('useSupabaseAuth: User authenticated:', currentSession.user.id);
          setUser(currentSession.user);
          setUserId(currentSession.user.id);
          
          // Update cache
          AUTH_CACHE.user = currentSession.user;
          AUTH_CACHE.userId = currentSession.user.id;
          AUTH_CACHE.lastChecked = Date.now();
          AUTH_CACHE.sessionExpiry = new Date(currentSession.expires_at || 0).getTime();
          
          // Load user profile if not already in cache
          if (!AUTH_CACHE.profileLoaded) {
            console.log('useSupabaseAuth: Loading user profile for', currentSession.user.id);
            const { data: profileData } = await supabase
              .from('profiles')
              .select('subscription_tier')
              .eq('id', currentSession.user.id)
              .single();
            
            if (profileData) {
              console.log('useSupabaseAuth: Profile loaded with tier:', profileData.subscription_tier);
              setSubscriptionTier(profileData.subscription_tier as SubscriptionTier);
              AUTH_CACHE.subscriptionTier = profileData.subscription_tier as SubscriptionTier;
              AUTH_CACHE.profileLoaded = true;
            } else {
              console.log('useSupabaseAuth: No profile found, using default tier');
              setSubscriptionTier('free');
            }
          }
        } else {
          console.log('useSupabaseAuth: No user session found');
          setUser(null);
          setUserId(null);
          // Clear cache when logged out
          AUTH_CACHE.user = null;
          AUTH_CACHE.userId = null;
          AUTH_CACHE.session = null;
          AUTH_CACHE.profileLoaded = false;
        }
      } catch (err) {
        console.error('useSupabaseAuth: Unexpected error during auth check', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Delay the initial check by a small amount to allow for other components to render first
    const initialCheckTimer = setTimeout(() => {
      checkAuth();
    }, 50);

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('useSupabaseAuth: Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('useSupabaseAuth: User signed in or token refreshed');
          setSession(currentSession);
          AUTH_CACHE.session = currentSession;
          
          if (currentSession) {
            setUser(currentSession.user);
            setUserId(currentSession.user.id);
            
            // Update cache
            AUTH_CACHE.user = currentSession.user;
            AUTH_CACHE.userId = currentSession.user.id;
            AUTH_CACHE.lastChecked = Date.now();
            AUTH_CACHE.sessionExpiry = new Date(currentSession.expires_at || 0).getTime();
            
            // Load user profile
            try {
              console.log('useSupabaseAuth: Loading user profile on sign in');
              const { data: profileData } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', currentSession.user.id)
                .single();
              
              if (profileData) {
                console.log('useSupabaseAuth: Profile loaded with tier:', profileData.subscription_tier);
                setSubscriptionTier(profileData.subscription_tier as SubscriptionTier);
                AUTH_CACHE.subscriptionTier = profileData.subscription_tier as SubscriptionTier;
                AUTH_CACHE.profileLoaded = true;
              }
            } catch (err) {
              console.error('useSupabaseAuth: Error loading profile', err);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('useSupabaseAuth: User signed out');
          setUser(null);
          setUserId(null);
          setSession(null);
          setSubscriptionTier('free');
          
          // Clear cache on sign out
          AUTH_CACHE.user = null;
          AUTH_CACHE.userId = null;
          AUTH_CACHE.session = null;
          AUTH_CACHE.subscriptionTier = 'free';
          AUTH_CACHE.profileLoaded = false;
          AUTH_CACHE.lastChecked = 0;
          AUTH_CACHE.sessionExpiry = 0;
        }
      }
    );

    return () => {
      console.log('useSupabaseAuth: Cleaning up auth state listener');
      clearTimeout(initialCheckTimer);
      authListener.subscription.unsubscribe();
    };
  }, [isCacheValid]);

  // Function to manually refresh the auth state
  const refresh = useCallback(async () => {
    console.log('useSupabaseAuth: Manual refresh requested');
    setIsLoading(true);
    
    const supabase = getClientSupabase();
    if (!supabase) {
      console.error('useSupabaseAuth: Failed to initialize Supabase client during refresh');
      setError(new AuthError('Failed to initialize authentication service'));
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('useSupabaseAuth: Refreshing session');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('useSupabaseAuth: Error refreshing session', error);
        setError(error);
      } else if (data && data.session) {
        console.log('useSupabaseAuth: Session refreshed successfully');
        setSession(data.session);
        setUser(data.session.user);
        setUserId(data.session.user.id);
        
        // Update cache
        AUTH_CACHE.user = data.session.user;
        AUTH_CACHE.userId = data.session.user.id;
        AUTH_CACHE.session = data.session;
        AUTH_CACHE.lastChecked = Date.now();
        AUTH_CACHE.sessionExpiry = new Date(data.session.expires_at || 0).getTime();
      }
    } catch (err) {
      console.error('useSupabaseAuth: Unexpected error during refresh', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    
    const supabase = getClientSupabase();
    if (!supabase) {
      console.error('useSupabaseAuth: Failed to initialize Supabase client during signOut');
      setError(new AuthError('Failed to initialize authentication service'));
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('useSupabaseAuth: Signing out user');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('useSupabaseAuth: Error signing out', error);
        setError(error);
      } else {
        // Clear state
        setUser(null);
        setUserId(null);
        setSession(null);
        setSubscriptionTier('free');
        
        // Clear cache
        AUTH_CACHE.user = null;
        AUTH_CACHE.userId = null;
        AUTH_CACHE.session = null;
        AUTH_CACHE.subscriptionTier = 'free';
        AUTH_CACHE.profileLoaded = false;
        AUTH_CACHE.lastChecked = 0;
        AUTH_CACHE.sessionExpiry = 0;
      }
    } catch (err) {
      console.error('useSupabaseAuth: Unexpected error during sign out', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    userId,
    session,
    isLoading,
    error,
    subscriptionTier,
    refresh,
    signOut,
    isAuthenticated: !!user,
  };
}; 