'use client';

import { useEffect, useState } from 'react';
import { getClientSupabase } from '@/app/lib/supabase';
import { Heading } from '@/app/components/heading';
import { Text } from '@/app/components/text';
import { Button } from '@/app/components/button';

// Define a type for cookie options
interface CookieOptions {
  path?: string;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  expires?: Date;
  [key: string]: string | number | boolean | Date | undefined;
}

export default function SyncCookiesPage() {
  const [status, setStatus] = useState<'syncing' | 'success' | 'error'>('syncing');
  const [message, setMessage] = useState('Synchronizing authentication cookies...');
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  
  useEffect(() => {
    // Get the redirect parameter
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/';
    setRedirectTo(redirect);
    
    // Try to force a session refresh to ensure cookies are set
    const syncCookies = async () => {
      try {
        const supabase = getClientSupabase();
        if (!supabase) {
          setStatus('error');
          setMessage('Failed to initialize Supabase client');
          return;
        }
        
        // Check if we have a session first
        const { data: initial } = await supabase.auth.getSession();
        if (!initial.session) {
          setStatus('error');
          setMessage('No active session found. Please log in again.');
          return;
        }
        
        console.log('SyncCookies: Current session found for user', initial.session.user.id);
        
        // Force a refresh of the session to ensure cookies are set
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Error refreshing session:', error);
          setStatus('error');
          setMessage(`Failed to sync cookies: ${error.message}`);
          return;
        }
        
        if (data.session) {
          console.log('SyncCookies: Successfully refreshed session for user', data.session.user.id);
          
          // Manually set cookies for middleware
          try {
            // Set the full session as cookie
            const sessionStr = JSON.stringify(data.session);
            setCookie('sb-gwvhbimnktyovdmdcdnm-auth-token', sessionStr, {
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 1 week
              sameSite: 'lax'
            });
            
            // Set individual token cookies that middleware might check
            setCookie('sb-access-token', data.session.access_token, {
              path: '/',
              maxAge: 60 * 60 * 24 * 7,
              sameSite: 'lax'
            });
            
            if (data.session.refresh_token) {
              setCookie('sb-refresh-token', data.session.refresh_token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
                sameSite: 'lax'
              });
            }
            
            console.log('SyncCookies: Manually set auth cookies');
          } catch (cookieErr) {
            console.error('Error setting cookies manually:', cookieErr);
          }
          
          setStatus('success');
          setMessage('Authentication cookies synchronized successfully');
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = redirect;
          }, 1000);
        } else {
          setStatus('error');
          setMessage('Failed to get session after refresh');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setMessage(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    syncCookies();
  }, []);
  
  // Helper function to set cookies
  function setCookie(name: string, value: string, options: CookieOptions = {}) {
    let cookieString = `${name}=${value}`;
    
    for (const optionKey in options) {
      cookieString += `; ${optionKey}`;
      const optionValue = options[optionKey];
      if (optionValue !== true) {
        // Handle Date object for expires
        if (optionValue instanceof Date) {
          cookieString += `=${optionValue.toUTCString()}`;
        } else {
          cookieString += `=${optionValue}`;
        }
      }
    }
    
    document.cookie = cookieString;
    console.log(`Set cookie: ${name} (length: ${value.length})`);
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <Heading level={1} className="text-2xl mb-4">
          {status === 'syncing' ? 'Syncing Authentication' : 
           status === 'success' ? 'Sync Complete' : 
           'Sync Error'}
        </Heading>
        
        {status === 'syncing' && (
          <div className="animate-pulse mb-4">
            <div className="h-16 w-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="mb-4 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {status === 'error' && (
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        <Text className="mb-4">{message}</Text>
        
        {redirectTo && status === 'success' && (
          <Text className="text-sm text-gray-500">
            Redirecting to {redirectTo === '/' ? 'home page' : redirectTo}...
          </Text>
        )}
        
        {status === 'error' && (
          <div className="mt-4 space-y-2">
            <Button 
              color="blue" 
              onClick={() => window.location.href = '/auth/login'}
              className="w-full"
            >
              Return to Login
            </Button>
            
            <Button 
              plain
              onClick={() => window.location.href = '/'}
              className="w-full text-gray-500"
            >
              Go to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}