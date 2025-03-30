import { getClientSupabase } from '@/app/lib/supabase';
import { Profile, ServiceError } from '@/app/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/app/lib/supabase';

/**
 * Get Supabase client and check if it's available
 */
function getSupabase(): SupabaseClient<Database> {
  const supabase = getClientSupabase();
  if (!supabase) {
    throw new Error('Failed to connect to Supabase client');
  }
  return supabase;
}

/**
 * Create a new user profile in the profiles table
 * This should be called after a successful signup
 */
export async function createUserProfile(
  userId: string,
  email: string,
  fullName?: string,
  avatarUrl?: string
): Promise<{ data: Profile | null, error: ServiceError | null }> {
  try {
    // First check if profile already exists to prevent duplicate creation
    const { data: existingProfile, error: checkError } = await getUserProfile(userId);
    
    // If we found an existing profile, return it
    if (existingProfile) {
      return { data: existingProfile, error: null };
    }
    
    // Only proceed with creation if we got a specific "not found" error
    if (!checkError) {
      return { data: null, error: new Error('Failed to check for existing profile') };
    }
    
    if (checkError && typeof checkError === 'object' && 'code' in checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', checkError);
      return { data: null, error: checkError };
    }
    
    // Get Supabase client
    const supabase = getSupabase();
    
    // Create a new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        subscription_tier: 'free',
        subscription_status: 'active',
        is_educator: false,
        has_used_trial: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user profile:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating user profile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to create user profile') 
    };
  }
}

/**
 * Create or update user profile on auth state change
 * This is used to ensure a profile exists for all authenticated users
 */
export async function ensureUserProfile(userId: string, email: string): Promise<{ data: Profile | null, error: ServiceError | null }> {
  return createUserProfile(userId, email);
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<{ data: Profile | null, error: ServiceError | null }> {
  try {
    // Get Supabase client
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating user profile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unexpected error updating user profile')
    };
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<{ data: Profile | null, error: ServiceError | null }> {
  try {
    // Get Supabase client
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    // If we get data, return it regardless of error state
    if (data) {
      return { data, error: null };
    }
    
    // Handle specific error cases
    if (error) {
      // PGRST116 means not found - this is expected when profile doesn't exist
      if ('code' in error && error.code === 'PGRST116') {
        return { data: null, error: { code: 'PGRST116', message: 'Profile not found' } };
      }
      
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
    
    // If we get here with no data and no error, treat as not found
    return { data: null, error: { code: 'PGRST116', message: 'Profile not found' } };
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to fetch user profile') 
    };
  }
} 