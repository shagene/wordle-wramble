import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

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
          voice_id: string;
          file_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          voice_id: string;
          file_path: string;
          created_at?: string;
        };
        Update: {
          text?: string;
          voice_id?: string;
          file_path?: string;
          created_at?: string;
        };
      };
    };
  };
};

// Create a browser client for client-side components
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create a direct client for API routes and server components
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Helper to check if Supabase keys are configured
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL !== '' && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== '';
};

// Helper to create a Supabase client with custom auth token
export const createClientWithToken = (token: string) => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
}; 