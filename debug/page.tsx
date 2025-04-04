'use client';

import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { getClientSupabase } from '@/app/lib/supabase';
import { Heading } from '@/app/components/heading';
import { Button } from '@/app/components/button';
import Link from 'next/link';

// Define a type for cookie options (same as in sync-cookies)
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

export default function DebugPage() {
  const [envVars, setEnvVars] = useState({
    NODE_ENV: '',
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    APP_URL: '',
  });
  
  const [session, setSession] = useState<Session | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cookies, setCookies] = useState<{name: string, exists: boolean, length?: number}[]>([]);
  const [localStorageTokens, setLocalStorageTokens] = useState<{key: string, exists: boolean, length?: number}[]>([]);
  const [logoutStatus, setLogoutStatus] = useState<string | null>(null);
  
  useEffect(() => {
    // Get environment variables
    setEnvVars({
      NODE_ENV: process.env.NODE_ENV || '',
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌',
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });
    
    // Check cookies
    const checkCookies = () => {
      const cookieList = [];
      const allCookies = document.cookie.split(';');
      
      // Check for specific auth cookies
      const authCookies = [
        'sb-access-token', 
        'sb-refresh-token', 
        'supabase-auth-token',
        'sb-auth-token',
        'sb-provider-token',
        'sb-provider-refresh-token',
        'sb-gwvhbimnktyovdmdcdnm-auth-token'
      ];
      
      for (const cookieName of authCookies) {
        const cookie = allCookies.find(c => c.trim().startsWith(`${cookieName}=`));
        if (cookie) {
          const value = cookie.split('=')[1];
          cookieList.push({
            name: cookieName,
            exists: true,
            length: value ? value.length : 0
          });
        } else {
          cookieList.push({
            name: cookieName,
            exists: false
          });
        }
      }
      
      setCookies(cookieList);
    };
    
    // Check localStorage
    const checkLocalStorage = () => {
      try {
        const tokenKeys = [
          'sb-gwvhbimnktyovdmdcdnm-auth-token',
          'supabase.auth.token',
          'sb-access-token',
          'sb-refresh-token'
        ];
        
        const tokens = tokenKeys.map(key => {
          const value = localStorage.getItem(key);
          return {
            key,
            exists: !!value,
            length: value ? value.length : 0
          };
        });
        
        setLocalStorageTokens(tokens);
      } catch (e) {
        console.error('Error checking localStorage:', e);
      }
    };
    
    // Check Supabase session
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const supabase = getClientSupabase();
        if (!supabase) {
          setSessionError('Failed to initialize Supabase client');
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setSessionError(error.message);
          return;
        }
        
        setSession(data.session);
        console.log('Debug page session:', data.session);
        
        // Also check cookies and localStorage
        checkCookies();
        checkLocalStorage();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setSessionError(err.message);
        } else {
          setSessionError('An unknown error occurred while checking the session.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up an interval to refresh the session info
    const refreshInterval = setInterval(() => {
      checkSession();
    }, 5000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  const handleForceLogout = async () => {
    const supabase = getClientSupabase();
    if (!supabase) {
      setSessionError('Failed to initialize Supabase client');
      return;
    }
    
    try {
      // Clear localStorage and cookies first for a clean logout
      setLogoutStatus('clearing-storage');
      
      // Clear all auth-related cookies
      clearAuthCookies();
      
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
      }
      
      // Now call the actual signOut method
      setLogoutStatus('signing-out');
      await supabase.auth.signOut();
      
      // Update UI
      setSession(null);
      
      // Navigate home after successful logout with logging_out flag
      // to prevent middleware redirection issues
      setLogoutStatus('redirecting');
      setTimeout(() => {
        window.location.href = '/?logging_out=true';
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSessionError(err.message);
      } else {
        setSessionError('An unknown error occurred during sign out.');
      }
      setLogoutStatus(null);
    }
  };
  
  const handleRedirectTest = () => {
    window.location.href = '/auth/login?redirect=%2Fgame';
  };
  
  const handleTestDirectNavigation = () => {
    window.location.href = '/game';
  };
  
  const handleForceRefreshSession = async () => {
    const supabase = getClientSupabase();
    if (!supabase) {
      setSessionError('Failed to initialize Supabase client');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        setSessionError('Failed to refresh session: ' + error.message);
      } else {
        console.log('Session refreshed:', !!data.session);
        setSession(data.session);
        
        // Try to set cookies manually too
        if (data.session) {
          setSessionAsCookies(data.session);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSessionError(err.message);
      } else {
        setSessionError('An unknown error occurred while refreshing the session.');
      }
    }
  };
  
  const handleSyncCookies = () => {
    window.location.href = '/auth/sync-cookies?redirect=/debug';
  };
  
  const handleCopyCookiesToLocalStorage = () => {
    try {
      if (!session) {
        setSessionError('No session available to copy');
        return;
      }
      
      // Store session in localStorage under various names
      const sessionStr = JSON.stringify(session);
      localStorage.setItem('sb-gwvhbimnktyovdmdcdnm-auth-token', sessionStr);
      console.log('Copied session to localStorage');
      
      window.location.reload();
    } catch (e) {
      console.error('Error copying to localStorage:', e);
      setSessionError('Error copying to localStorage: ' + String(e));
    }
  };
  
  const handleCopyLocalStorageToCookies = () => {
    try {
      const tokenStr = localStorage.getItem('sb-gwvhbimnktyovdmdcdnm-auth-token');
      if (!tokenStr) {
        setSessionError('No token found in localStorage');
        return;
      }
      
      const session = JSON.parse(tokenStr);
      setSessionAsCookies(session);
      console.log('Copied localStorage token to cookies');
      
      window.location.reload();
    } catch (e) {
      console.error('Error copying to cookies:', e);
      setSessionError('Error copying to cookies: ' + String(e));
    }
  };
  
  // Helper to set cookies
  function setSessionAsCookies(session: Session) {
    try {
      // Set the full session as cookie
      const sessionStr = JSON.stringify(session);
      setCookie('sb-gwvhbimnktyovdmdcdnm-auth-token', sessionStr, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax'
      });
      
      // Set individual token cookies that middleware might check
      if (session.access_token) {
        setCookie('sb-access-token', session.access_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax'
        });
      }
      
      if (session.refresh_token) {
        setCookie('sb-refresh-token', session.refresh_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax'
        });
      }
      
      console.log('Set session as cookies');
    } catch (e) {
      console.error('Error setting cookies:', e);
      setSessionError('Error setting cookies: ' + String(e));
    }
  }
  
  // Helper to clear cookies
  function clearAuthCookies() {
    const authCookies = [
      'sb-access-token', 
      'sb-refresh-token', 
      'supabase-auth-token',
      'sb-auth-token',
      'sb-provider-token',
      'sb-provider-refresh-token',
      'sb-gwvhbimnktyovdmdcdnm-auth-token'
    ];
    
    for (const name of authCookies) {
      document.cookie = `${name}=; Max-Age=0; path=/;`;
    }
    
    console.log('Cleared auth cookies');
  }
  
  // Helper to set cookies
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
    <div className="container mx-auto p-6">
      <Heading level={1} className="mb-6">Debug Information</Heading>
      
      <div className="mb-8">
        <Heading level={2} className="text-xl mb-4">Environment Variables</Heading>
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 dark:bg-gray-800">
          <table className="w-full">
            <tbody>
              {Object.entries(envVars).map(([key, value]) => (
                <tr key={key} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4 font-bold">{key}:</td>
                  <td className="py-2 px-4">
                    {key.includes('KEY') && typeof value === 'string' && !['✅', '❌'].includes(value) 
                      ? value.substring(0, 10) + '...' 
                      : value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8">
        <Heading level={2} className="text-xl mb-4">Authentication Cookies</Heading>
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 dark:bg-gray-800">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-2 px-4 text-left">Cookie Name</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Length</th>
              </tr>
            </thead>
            <tbody>
              {cookies.map((cookie, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4 font-mono text-sm">{cookie.name}</td>
                  <td className="py-2 px-4">
                    {cookie.exists ? 
                      <span className="text-green-600 font-bold">✓ Present</span> : 
                      <span className="text-red-600 font-bold">✗ Missing</span>}
                  </td>
                  <td className="py-2 px-4">{cookie.exists ? cookie.length : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8">
        <Heading level={2} className="text-xl mb-4">LocalStorage Tokens</Heading>
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 dark:bg-gray-800">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-2 px-4 text-left">Key</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Length</th>
              </tr>
            </thead>
            <tbody>
              {localStorageTokens.map((token, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4 font-mono text-sm">{token.key}</td>
                  <td className="py-2 px-4">
                    {token.exists ? 
                      <span className="text-green-600 font-bold">✓ Present</span> : 
                      <span className="text-red-600 font-bold">✗ Missing</span>}
                  </td>
                  <td className="py-2 px-4">{token.exists ? token.length : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8">
        <Heading level={2} className="text-xl mb-4">Authentication Status</Heading>
        <div className="bg-white rounded-lg shadow-md p-4 dark:bg-gray-800">
          {isLoading ? (
            <p>Loading session information...</p>
          ) : sessionError ? (
            <p className="text-red-600">{sessionError}</p>
          ) : session ? (
            <div>
              <p className="mb-2 font-bold text-green-600">✓ Authenticated</p>
              <p className="mb-2"><strong>User ID:</strong> {session.user?.id}</p>
              <p className="mb-2"><strong>Email:</strong> {session.user?.email}</p>
              <p className="mb-2"><strong>Token expires:</strong> {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'unknown'}</p>
              <p className="mb-2"><strong>User Created at:</strong> {session.user?.created_at ? new Date(session.user?.created_at).toLocaleString() : 'unknown'}</p>
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Show Raw Session Data</summary>
                <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto max-h-60 text-xs dark:bg-gray-900">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="font-bold text-red-600">✗ Not authenticated</p>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <Heading level={2} className="text-xl mb-4">Test Actions</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button color="blue" onClick={handleForceLogout} disabled={logoutStatus !== null}>
            {logoutStatus === 'clearing-storage' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Clearing Storage...
              </>
            ) : logoutStatus === 'signing-out' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing Out...
              </>
            ) : logoutStatus === 'redirecting' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecting...
              </>
            ) : (
              'Force Logout'
            )}
          </Button>
          <Button color="purple" onClick={handleRedirectTest}>
            Test Login Redirect
          </Button>
          <Button color="green" onClick={handleTestDirectNavigation}>
            Test Direct Navigation to Protected Page
          </Button>
          <Button color="orange" onClick={handleForceRefreshSession}>
            Force Refresh Session
          </Button>
          <Button color="yellow" onClick={handleSyncCookies}>
            Force Sync Cookies
          </Button>
          <Button color="cyan" onClick={handleCopyCookiesToLocalStorage}>
            Copy Session → LocalStorage
          </Button>
          <Button color="indigo" onClick={handleCopyLocalStorageToCookies}>
            Copy LocalStorage → Cookies
          </Button>
          <Button color="red" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
      
      <div className="mt-12">
        <Link href="/">
          <Button outline>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
} 