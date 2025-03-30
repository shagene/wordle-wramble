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
    // --- DRASTIC SIMPLIFICATION --- 
    // Hardcode values directly here to test client creation
    const supabaseUrl = 'https://gwvhbimnktyovdmdcdnm.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dmhiaW1ua3R5b3ZkbWRjZG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTA0OTcsImV4cCI6MjA1ODE4NjQ5N30.AMUH2C4ESS6GohZ7X2Lzoj0X9OB2eaA-lO26dffEUxk';

    console.log('[getClientSupabase] Before createClient call. URL:', supabaseUrl ? 'Set' : 'Not Set', 'Key:', supabaseAnonKey ? 'Set' : 'Not Set');
    console.log('[getClientSupabase] Key Length:', supabaseAnonKey?.length);

    // Check if values are actually strings and non-empty
    if (typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '' || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
      throw new Error(`Invalid Supabase config: URL type ${typeof supabaseUrl}, Key type ${typeof supabaseAnonKey}`);
    }

    // Create the client instance with direct hardcoded values 
    _browserSupabaseClient = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: customStorage // Reuse the existing storage adapter
        }
      }
    );

    console.log('[getClientSupabase] Supabase client initialization attempted.');
    if (!_browserSupabaseClient) {
       console.error('[getClientSupabase] createClient returned null or undefined!');
    } else {
       console.log('[getClientSupabase] Supabase client initialized successfully');
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