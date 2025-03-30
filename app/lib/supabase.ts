// Start of file console logs
console.log('[supabase.ts] Module initializing');
console.log('[supabase.ts] Environment variables check:');
console.log('[supabase.ts] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? `defined: ${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...` : 'undefined');
console.log('[supabase.ts] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `defined: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : 'undefined');

import { createClient } from '@supabase/supabase-js';

// These types will be used for the database schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: string;
          subscription_status: string;
          stripe_customer_id: string | null;
          subscription_id: string | null;
          is_educator: boolean;
          trial_start_date: string | null;
          trial_end_date: string | null;
          has_used_trial: boolean;
          organization_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string;
          subscription_status?: string;
          stripe_customer_id?: string | null;
          subscription_id?: string | null;
          is_educator?: boolean;
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          has_used_trial?: boolean;
          organization_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string;
          subscription_status?: string;
          stripe_customer_id?: string | null;
          subscription_id?: string | null;
          is_educator?: boolean;
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          has_used_trial?: boolean;
          organization_id?: string | null;
          updated_at?: string;
        };
      };
      word_lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          words: string[];
          hints: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          words: string[];
          hints?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          words?: string[];
          hints?: string[] | null;
          updated_at?: string;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          word_list_id: string;
          word_index: number;
          attempts: number;
          completed: boolean;
          stars: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_list_id: string;
          word_index: number;
          attempts?: number;
          completed?: boolean;
          stars?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          word_list_id?: string;
          word_index?: number;
          attempts?: number;
          completed?: boolean;
          stars?: number;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      audio_cache: {
        Row: {
          id: string;
          text: string;
          text_hash: string;
          voice_id: string;
          file_path: string;
          file_size: number;
          access_count: number;
          last_accessed: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          text_hash: string;
          voice_id: string;
          file_path: string;
          file_size: number;
          access_count?: number;
          last_accessed?: string;
          created_at?: string;
        };
        Update: {
          text?: string;
          text_hash?: string;
          voice_id?: string;
          file_path?: string;
          file_size?: number;
          access_count?: number;
          last_accessed?: string;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          feature: string;
          count: number;
          reset_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          feature: string;
          count?: number;
          reset_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          feature?: string;
          count?: number;
          reset_at?: string;
          updated_at?: string;
        };
      };
      promotions: {
        Row: {
          id: string;
          name: string;
          type: string;
          value: number | null;
          code: string | null;
          start_date: string | null;
          end_date: string | null;
          max_uses: number | null;
          current_uses: number;
          applies_to_tiers: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          value?: number | null;
          code?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          applies_to_tiers: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: string;
          value?: number | null;
          code?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          applies_to_tiers?: string[];
          updated_at?: string;
        };
      };
      user_promotions: {
        Row: {
          id: string;
          user_id: string;
          promotion_id: string;
          claimed_at: string;
          applied_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          promotion_id: string;
          claimed_at?: string;
          applied_at?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          promotion_id?: string;
          claimed_at?: string;
          applied_at?: string | null;
        };
      };
      educator_verifications: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          verification_method: string;
          proof_url: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          verification_method: string;
          proof_url?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          status?: string;
          verification_method?: string;
          proof_url?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          contact_email: string;
          contact_name: string | null;
          subscription_id: string | null;
          stripe_customer_id: string | null;
          max_seats: number;
          active_seats: number;
          billing_frequency: string;
          custom_price_per_seat: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_email: string;
          contact_name?: string | null;
          subscription_id?: string | null;
          stripe_customer_id?: string | null;
          max_seats: number;
          active_seats?: number;
          billing_frequency?: string;
          custom_price_per_seat?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          contact_email?: string;
          contact_name?: string | null;
          subscription_id?: string | null;
          stripe_customer_id?: string | null;
          max_seats?: number;
          active_seats?: number;
          billing_frequency?: string;
          custom_price_per_seat?: number | null;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          organization_id?: string;
          user_id?: string;
          role?: string;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      organization_resources: {
        Row: {
          id: string;
          organization_id: string;
          resource_type: string;
          resource_id: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          resource_type: string;
          resource_id: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          organization_id?: string;
          resource_type?: string;
          resource_id?: string;
          created_by?: string | null;
          updated_at?: string;
        };
      };
      subscription_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          old_tier: string | null;
          new_tier: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          old_tier?: string | null;
          new_tier?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          event_type?: string;
          old_tier?: string | null;
          new_tier?: string | null;
          metadata?: Record<string, unknown> | null;
        };
      };
    };
  };
};

// Re-add common storage definition for auth persistence
export const customStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

// Create a browser-only singleton client to ensure we only use this on the client side
let _browserSupabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export const getClientSupabase = () => {
  console.log('[getClientSupabase] Function called. typeof window:', typeof window);
  
  // IMPORTANT: Only run on the client side
  if (typeof window === 'undefined') {
    console.warn('[getClientSupabase] Called on server side - returning null');
    return null;
  }

  // If we already have a client instance, return it
  if (_browserSupabaseClient) {
    console.log('[getClientSupabase] Returning existing client instance');
    return _browserSupabaseClient;
  }

  try {
    // Get values from environment variables instead of hardcoding
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('[getClientSupabase] Before createClient call. URL:', supabaseUrl ? 'Set' : 'Not Set', 'Key:', supabaseAnonKey ? 'Set' : 'Not Set');
    
    if (supabaseAnonKey) {
      console.log('[getClientSupabase] Key Length:', supabaseAnonKey.length);
    }

    // Check if values are actually strings and non-empty
    if (!supabaseUrl || !supabaseAnonKey || typeof supabaseUrl !== 'string' || typeof supabaseAnonKey !== 'string') {
      throw new Error(`Invalid Supabase config: URL or Key missing or invalid`);
    }

    // Try to extract the domain for proper cookie config
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    console.log('[getClientSupabase] Detected project ref:', projectRef || 'unknown');
    
    // Create the client instance with improved cookie handling
    _browserSupabaseClient = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: {
            // Store in both localStorage and cookies
            getItem: (key) => {
              try {
                // Try to get from localStorage first
                const storedValue = localStorage.getItem(key);
                console.log(`[Storage] Getting key ${key}: ${storedValue ? 'found' : 'not found'}`);
                
                // Also try to manually read a cookie with the same name
                try {
                  const cookieName = key.replace('sb-', 'sb-gwvhbimnktyovdmdcdnm-');
                  const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
                  if (match) console.log(`[Storage] Found cookie ${cookieName} with length ${match[2].length}`);
                } catch (e) {
                  // Ignore cookie errors
                }
                
                return storedValue;
              } catch (error) {
                console.error(`[Storage] Error getting ${key}:`, error);
                return null;
              }
            },
            setItem: (key, value) => {
              try {
                // Store in localStorage
                localStorage.setItem(key, value);
                console.log(`[Storage] Set key ${key} (length: ${value.length})`);
                
                // Also store in cookies directly
                try {
                  // Parse the data to get session info
                  let session = null;
                  try {
                    session = JSON.parse(value);
                    console.log(`[Storage] Session info - expires_at:`, session?.expires_at || 'unknown');
                    
                    // If this is auth-token, set it as a cookie too
                    if (key === 'sb-gwvhbimnktyovdmdcdnm-auth-token' && session) {
                      // Set the cookies that middleware expects
                      setCookie('sb-gwvhbimnktyovdmdcdnm-auth-token', value, {
                        path: '/',
                        maxAge: 60 * 60 * 24 * 7, // 1 week
                        domain: window.location.hostname,
                        sameSite: 'lax'
                      });
                      
                      // Also set the access token and refresh token separately
                      if (session.access_token) {
                        setCookie('sb-access-token', session.access_token, {
                          path: '/',
                          maxAge: 60 * 60 * 24 * 7, 
                          domain: window.location.hostname,
                          sameSite: 'lax'
                        });
                      }
                      
                      if (session.refresh_token) {
                        setCookie('sb-refresh-token', session.refresh_token, {
                          path: '/',
                          maxAge: 60 * 60 * 24 * 7, 
                          domain: window.location.hostname,
                          sameSite: 'lax'
                        });
                      }
                      
                      console.log(`[Storage] Set cookies for auth`);
                    }
                  } catch (e) {
                    // Not a JSON value, that's fine
                  }
                } catch (e) {
                  console.error(`[Storage] Error setting cookies:`, e);
                }
              } catch (error) {
                console.error(`[Storage] Error setting ${key}:`, error);
              }
            },
            removeItem: (key) => {
              try {
                localStorage.removeItem(key);
                console.log(`[Storage] Removed key ${key}`);
                
                // Also remove cookies
                try {
                  // List all possible cookie names to clear
                  const cookiesToClear = [
                    // Project-specific auth token
                    key.replace('sb-', 'sb-gwvhbimnktyovdmdcdnm-'),
                    // Generic auth cookies
                    'sb-access-token',
                    'sb-refresh-token',
                    'supabase-auth-token',
                    'sb-auth-token',
                    'sb-provider-token',
                    'sb-provider-refresh-token',
                    // Specific auth token 
                    'sb-gwvhbimnktyovdmdcdnm-auth-token',
                    // Indexed variants
                    'sb-gwvhbimnktyovdmdcdnm-auth-token.0',
                    'sb-gwvhbimnktyovdmdcdnm-auth-token.1',
                    'sb-gwvhbimnktyovdmdcdnm-auth-token.2',
                    'sb-gwvhbimnktyovdmdcdnm-auth-token.3',
                    'sb-gwvhbimnktyovdmdcdnm-auth-token.4'
                  ];
                  
                  // Clear all possible domains to ensure cookies are properly removed
                  const domains = [
                    window.location.hostname,
                    window.location.hostname.split('.').slice(1).join('.'), // Remove subdomain
                    '' // No domain = current domain
                  ];
                  
                  for (const cookieName of cookiesToClear) {
                    for (const domain of domains) {
                      const cookieString = `${cookieName}=; Max-Age=0; path=/; ${domain ? `domain=${domain};` : ''} SameSite=Lax`;
                      document.cookie = cookieString;
                    }
                  }
                  console.log(`[Storage] Removed all auth cookies for key ${key}`);
                } catch (e) {
                  console.error(`[Storage] Error removing cookies:`, e);
                }
              } catch (error) {
                console.error(`[Storage] Error removing ${key}:`, error);
              }
            }
          },
          // Set the auth method to use cookies
          flowType: 'pkce',
          // Set a debug flag to get more information
          debug: process.env.NODE_ENV === 'development'
        },
      }
    );

    // Set up an auth state change listener to handle sign out
    _browserSupabaseClient.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth] Auth state changed: ${event}`);
      
      if (event === 'SIGNED_OUT') {
        console.log('[Auth] Session signed out, clearing all auth storage');
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
            console.log(`[Auth] Removed localStorage key: ${key}`);
          }
          
          // Also clear cookies manually to ensure complete cleanup
          clearAllAuthCookies();
        } catch (e) {
          console.error('[Auth] Error during storage cleanup:', e);
        }
      }
    });
    
    // Helper function to set cookies
    function setCookie(name: string, value: string, options: { [key: string]: any } = {}) {
      let cookieString = `${name}=${value}`;
      
      for (const optionKey in options) {
        cookieString += `; ${optionKey}`;
        const optionValue = options[optionKey];
        if (optionValue !== true) {
          cookieString += `=${optionValue}`;
        }
      }
      
      document.cookie = cookieString;
    }
    
    // Helper function to clear all auth-related cookies
    function clearAllAuthCookies() {
      // List all possible cookie names to clear
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
      
      // Clear on all possible domains
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
      
      console.log('[Auth] Cleared all auth cookies');
    }

    console.log('[getClientSupabase] Supabase client initialization attempted.');
    if (!_browserSupabaseClient) {
       console.error('[getClientSupabase] createClient returned null or undefined!');
    } else {
       console.log('[getClientSupabase] Supabase client initialized successfully');
       
       // Test the client if it was successfully created
       _browserSupabaseClient.auth.getSession().then(({ data, error }) => {
         if (error) {
           console.error('[getClientSupabase] Session test error:', error);
         } else {
           console.log('[getClientSupabase] Session test success:', data.session ? 'Session exists' : 'No session');
           if (data.session) {
             console.log('[getClientSupabase] User ID:', data.session.user.id);
             
             // Force cookies to be properly set
             _browserSupabaseClient?.auth.getSession().then(({ error }) => {
               if (error) {
                 console.error('[getClientSupabase] Error refreshing cookies:', error);
               } else {
                 console.log('[getClientSupabase] Cookies refreshed');
               }
             });
           }
         }
       });
    }
    
    return _browserSupabaseClient;
  } catch (error) {
    console.error('[getClientSupabase] Error during initialization:', error);
    // Log the exact error message if available
    if (error instanceof Error) {
      console.error('[getClientSupabase] Error message:', error.message);
    }
    return null;
  }
};

// Add request/response monitoring for debugging
if (process.env.NODE_ENV === 'development') {
  // Add interceptor to log requests and responses
  const originalFetch = globalThis.fetch;
  
  globalThis.fetch = async (input, init) => {
    // Only intercept Supabase requests
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    // Check if this is a Supabase request to the word_lists table
    if (url.includes('supabase') && url.includes('word_lists')) {
      console.log(`🔵 Supabase Request:`, {
        url,
        method: init?.method || 'GET',
        headers: init?.headers,
        body: init?.body ? JSON.parse(init.body.toString()) : undefined
      });
      
      try {
        const response = await originalFetch(input, init);
        
        // Clone the response so we can read the body and still return a usable response
        const clone = response.clone();
        const responseBody = await clone.text();
        
        console.log(`🟢 Supabase Response:`, {
          url,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody ? JSON.parse(responseBody) : undefined
        });
        
        return response;
      } catch (error: unknown) {
        console.log(`🔴 Supabase Error:`, {
          url,
          error
        });
        throw error;
      }
    }
    
    // Pass through all other requests
    return originalFetch(input, init);
  };
} 