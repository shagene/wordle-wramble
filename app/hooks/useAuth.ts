'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { getClientSupabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { env, checkRequiredEnvVars } from '../lib/env';

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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Unknown error during sign out'));
    }
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