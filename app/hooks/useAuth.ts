'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { getClientSupabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { env } from '../lib/env';

// Define the auth context type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null; // Add error property to the context
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('[AuthProvider] Rendering or executing...');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  // Get the supabase client instance lazily
  const supabase = getClientSupabase();

  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    const setupAuth = async () => {
      try {
        // Ensure supabase client is available (it should be on the client)
        if (!supabase) {
          console.error('[AuthProvider] Supabase client is not available. Auth cannot initialize.');
          setError(new Error('Authentication service initialization failed.'));
          setIsLoading(false);
          return;
        }

        // Get the initial session
        try {
          setIsLoading(true);
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            setError(sessionError);
          }

          if (data?.session) {
            setSession(data.session);
            setUser(data.session.user);
          }
        } catch (sessionError) {
          console.error('Unexpected error during getInitialSession:', sessionError);
          setError(sessionError instanceof Error ? sessionError : new Error('Unknown authentication error'));
        } finally {
          setIsLoading(false);
        }

        // Listen for auth changes
        try {
          const listener = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, newSession: Session | null) => {
              console.log(`Auth state changed: ${event}`);
              setSession(newSession);
              setUser(newSession?.user ?? null);

              // Handle specific auth events if needed (e.g., redirect on PASSWORD_RECOVERY)
              if (event === 'PASSWORD_RECOVERY') {
                // Redirect to the password update page
                router.push('/auth/update-password');
              }
            }
          );
          
          authListener = listener.data;
        } catch (listenerError) {
          console.error('Error setting up auth listener:', listenerError);
        }
      } catch (setupError) {
        console.error('Error in auth setup:', setupError);
        setError(setupError instanceof Error ? setupError : new Error('Auth setup failed'));
        setIsLoading(false);
      }
    };

    setupAuth();

    // Cleanup subscription on unmount
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase, router]); // Add supabase and router to dependency array

  // Sign in function
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      const error = new Error("Authentication service is unavailable");
      console.error('Error signing in:', error);
      return { error, data: null };
    }
    
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error, data: null };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      const error = new Error("Authentication service is unavailable");
      console.error('Error signing up:', error);
      return { error, data: null };
    }
    
    try {
      const response = await supabase.auth.signUp({ email, password });
      return response;
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as Error, data: null };
    }
  };

  // Sign out function
  const signOut = async () => {
    if (!supabase) {
      setError(new Error("Authentication service is unavailable"));
      return;
    }
    
    try {
      // First try the standard signOut method
      await supabase.auth.signOut();
      
      // Manual cleanup to ensure everything is cleared
      try {
        // Clear localStorage of all Supabase-related items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('sb-') || 
            key.includes('supabase') || 
            key.includes('auth')
          )) {
            keysToRemove.push(key);
          }
        }
        
        // Remove all matched keys
        for (const key of keysToRemove) {
          localStorage.removeItem(key);
          console.log(`[Auth] Manually removed localStorage key during signOut: ${key}`);
        }
        
        // Clear all cookies manually
        clearAllAuthCookies();
        
        // Force state update to make sure the UI updates
        setUser(null);
        setSession(null);
        
        // Redirect to home page after logout
        router.push('/');
        router.refresh(); // Force a full refresh to clear navigation state
      } catch (cleanupError) {
        console.error('Error during manual cleanup:', cleanupError);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Unknown error during sign out'));
    }
  };
  
  // Helper function to clear all auth cookies
  const clearAllAuthCookies = () => {
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'sb-auth-token',
      'sb-provider-token',
      'sb-provider-refresh-token',
      'sb-gwvhbimnktyovdmdcdnm-auth-token',
      'sb-gwvhbimnktyovdmdcdnm-auth-token.0',
      'sb-gwvhbimnktyovdmdcdnm-auth-token.1',
      'sb-gwvhbimnktyovdmdcdnm-auth-token.2',
      'sb-gwvhbimnktyovdmdcdnm-auth-token.3',
      'sb-gwvhbimnktyovdmdcdnm-auth-token.4'
    ];
    
    // Clear on multiple domains to be thorough
    const domains = [
      window.location.hostname,
      window.location.hostname.split('.').slice(1).join('.'), // Remove subdomain
      '' // No domain = current domain
    ];
    
    for (const cookieName of cookiesToClear) {
      for (const domain of domains) {
        document.cookie = `${cookieName}=; Max-Age=0; path=/; ${domain ? `domain=${domain};` : ''} SameSite=Lax`;
      }
    }
    
    console.log('[Auth] Manually cleared all auth cookies during signOut');
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    if (!supabase) {
      const error = new Error("Authentication service is unavailable");
      return { error };
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.APP_URL}/auth/update-password`, 
      });
      return { error };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error: error as Error };
    }
  };

  // Create the value object for the context
  const value = {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  // Return the provider with the value and children
  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  console.log('[useAuth] Hook called');
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 