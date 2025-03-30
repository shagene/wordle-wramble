'use client';

import { useEffect, useState, ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth';
import { AuthLoading } from '@/app/ui/auth/AuthLoading';
import { createRedirectUrl } from '@/app/lib/navigation/routes';
import { getClientSupabase } from '@/app/lib/supabase';

interface RouteGuardProps {
  children: ReactNode;
}

// Cache previous auth results for much longer to prevent unnecessary loading states
const authCache = {
  userId: null as string | null,
  hasSession: false,
  lastChecked: 0,
  // Extend cache validity to 30 minutes
  validDuration: 30 * 60 * 1000
};

export function RouteGuard({ children }: RouteGuardProps) {
  console.log('=== RouteGuard RENDER START ===');
  
  const { userId, isLoading, error, refresh } = useSupabaseAuth();
  console.log('RouteGuard: useSupabaseAuth state:', { userId, isLoading, error: !!error });
  
  const router = useRouter();
  const pathname = usePathname();
  console.log('RouteGuard: Current pathname:', pathname);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const redirectAttempted = useRef(false);
  const initialRender = useRef(true);
  
  // Start with true if we have a cached session
  const [shouldShowLoading, setShouldShowLoading] = useState(!authCache.hasSession);

  console.log('RouteGuard: Current state:', { 
    isAuthorized,
    isCheckingSession, 
    hasSession, 
    redirectAttempted: redirectAttempted.current
  });

  // First, check if we have a cached auth state
  useEffect(() => {
    const now = Date.now();
    // If we have a recent auth cache and the user was authenticated, use it without any delay
    if (now - authCache.lastChecked < authCache.validDuration && (authCache.userId || authCache.hasSession)) {
      console.log('RouteGuard: Using cached auth data, skipping verification');
      setIsAuthorized(true);
      setHasSession(true);
      setShouldShowLoading(false);
      return;
    }

    // Only perform direct session check if not already authenticated via hook
    if (!userId && !isAuthorized && initialRender.current) {
      initialRender.current = false;
      
      // Check for session directly without showing loading state immediately
      setIsCheckingSession(true);
      
      // Don't set loading immediately - wait for an actual delay
      const loadingTimer = setTimeout(() => {
        if (isCheckingSession) {
          setShouldShowLoading(true);
        }
      }, 300);
      
      // Get the supabase client
      const supabase = getClientSupabase();
      if (!supabase) {
        console.error('RouteGuard: Failed to connect to authentication service');
        setIsCheckingSession(false);
        clearTimeout(loadingTimer);
        return;
      }
      
      supabase.auth.getSession().then(({ data }) => {
        const sessionExists = !!data.session;
        
        if (sessionExists) {
          // Update the auth cache with longer validity
          authCache.userId = data.session?.user?.id || null;
          authCache.hasSession = true;
          authCache.lastChecked = Date.now();
          
          setHasSession(true);
          setIsAuthorized(true);
          setShouldShowLoading(false);
        }
        
        setIsCheckingSession(false);
        clearTimeout(loadingTimer);
      }).catch(() => {
        setIsCheckingSession(false);
        clearTimeout(loadingTimer);
      });
    }
  }, [userId, isAuthorized, isCheckingSession]);

  // Monitor auth changes from useSupabaseAuth
  useEffect(() => {
    if (userId) {
      // Update auth cache when we get a userId
      authCache.userId = userId;
      authCache.hasSession = true;
      authCache.lastChecked = Date.now();
      
      setIsAuthorized(true);
      setShouldShowLoading(false);
    }
  }, [userId, isCheckingSession]);

  // Redirect logic separated into its own effect
  useEffect(() => {
    console.log('RouteGuard: Redirect useEffect triggered', {
      isLoading,
      isCheckingSession,
      isAuthorized,
      userId: userId ? 'exists' : 'null',
      hasSession,
      redirectAttempted: redirectAttempted.current
    });
    
    // Only redirect if:
    // 1. Not still loading any auth state
    // 2. Not authorized
    // 3. Confirmed no session or userId exists
    // 4. Haven't already attempted to redirect (prevent loops)
    if (!isLoading && 
        !isCheckingSession && 
        !isAuthorized && 
        !userId && 
        !hasSession && 
        !redirectAttempted.current) {
      
      console.log('RouteGuard: Conditions met for redirect');
      console.log('RouteGuard: Redirecting to login page');
      redirectAttempted.current = true;
      console.log('RouteGuard: Set redirectAttempted to true');
      
      // Add a shorter delay - we've already checked auth status efficiently
      const redirectTimer = setTimeout(() => {
        console.log('RouteGuard: Redirect timer fired, pushing to', createRedirectUrl('/auth/login', pathname));
        router.push(createRedirectUrl('/auth/login', pathname));
      }, 100);
      
      return () => {
        console.log('RouteGuard: Clearing redirect timer in cleanup');
        clearTimeout(redirectTimer);
      };
    } else {
      console.log('RouteGuard: Redirect conditions NOT met:', {
        isLoadingCheck: !isLoading ? 'passed' : 'failed',
        isCheckingSessionCheck: !isCheckingSession ? 'passed' : 'failed',
        isAuthorizedCheck: !isAuthorized ? 'passed' : 'failed',
        userIdCheck: !userId ? 'passed' : 'failed',
        hasSessionCheck: !hasSession ? 'passed' : 'failed',
        redirectAttemptedCheck: !redirectAttempted.current ? 'passed' : 'failed'
      });
    }
  }, [isLoading, isCheckingSession, isAuthorized, userId, hasSession, router, pathname]);

  // Reset redirect attempt flag if auth state changes
  useEffect(() => {
    console.log('RouteGuard: Reset redirect flag useEffect triggered', {
      userId: userId ? 'exists' : 'null',
      hasSession,
      redirectAttempted: redirectAttempted.current
    });
    
    if (userId || hasSession) {
      console.log('RouteGuard: Auth detected, resetting redirectAttempted to false');
      redirectAttempted.current = false;
    }
    
    // Log when this effect is cleaned up
    return () => {
      console.log('RouteGuard: Reset redirect flag useEffect cleanup');
    };
  }, [userId, hasSession]);

  // If there's an error with authentication
  if (error) {
    console.error('RouteGuard: Authentication error, rendering error UI:', error);
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          <h3 className="text-lg font-semibold mb-2">Authentication Error</h3>
          <p className="mb-4">{error.message || 'Failed to authenticate'}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => refresh()} 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/auth/login')} 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't show loading for already authenticated users, cached auth, or short checks
  if ((isLoading || isCheckingSession) && !isAuthorized && !authCache.hasSession && shouldShowLoading) {
    console.log('RouteGuard: Still loading or checking session, rendering loading UI');
    return <AuthLoading />;
  }

  // If authorized by any method, render the protected content
  if (isAuthorized || userId || hasSession || authCache.userId || authCache.hasSession) {
    console.log('RouteGuard: User is authorized, rendering children');
    return <>{children}</>;
  }

  // If not authorized and not loading, show loading while the redirect happens
  console.log('RouteGuard: User is not authorized, rendering loading UI while redirecting');
  console.log('=== RouteGuard RENDER END ===');
  return <AuthLoading />;
}

export default RouteGuard; 