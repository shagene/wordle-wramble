'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientSupabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from '../../components/button';
import { Text } from '../../components/text';
import { Heading } from '../../components/heading';
import { Badge } from '../../components/badge';
import { Avatar } from '../../components/avatar';
import { Divider } from '../../components/divider';

interface Profile {
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
}

interface UserWithProfile extends User {
  profile?: Profile;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        
        const supabase = getClientSupabase();
        if (!supabase) {
          setError('Failed to connect to authentication service');
          return;
        }
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          // No session means not logged in
          setError('Not logged in');
          return;
        }
        
        // Set user from session
        setUser(session.user as UserWithProfile);
        
        // Get additional profile data from the database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "Relation does not exist"
          console.warn('Error fetching profile:', profileError);
        } else if (profile) {
          // Merge profile data with user
          setUser((prev: UserWithProfile | null) => {
            if (!prev) return null;
            return { ...prev, profile };
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    
    getProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = getClientSupabase();
      if (!supabase) {
        setError('Failed to connect to authentication service');
        return;
      }
      
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Helper function to get initials from email
  const getInitials = (email: string | undefined) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  // Helper function to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-4">
      {/* Decorative background elements */}
      <div className="absolute top-40 left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-3xl mx-auto z-10 relative">
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000 mb-8 text-center">
          <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-5xl text-blue-600 dark:text-blue-400">
            Your Profile
          </Heading>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40 animate-pulse">
            <span className="text-3xl font-[family-name:var(--font-bubblegum-sans)] text-blue-500">Loading profile...</span>
          </div>
        ) : error ? (
          <div className="animate-in fade-in bg-red-50 border border-red-200 text-red-800 rounded-2xl p-8 mb-6 text-center shadow-lg">
            <Text className="mb-4 text-lg">{error}</Text>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-[family-name:var(--font-bubblegum-sans)] rounded-xl py-3 px-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Go to Login
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-8 text-white">
                <div className="flex items-center gap-6">
                  <Avatar 
                    initials={getInitials(user?.email)}
                    className="w-24 h-24 bg-white text-purple-600 text-3xl shadow-lg border-4 border-white"
                  />
                  <div>
                    <h2 className="text-2xl font-[family-name:var(--font-bubblegum-sans)]">
                      {user?.profile?.full_name || user?.email?.split('@')[0] || 'User'}
                    </h2>
                    <p className="opacity-80">{user?.email}</p>
                    <div className="mt-2">
                      <Badge color={user?.profile?.subscription_tier === 'premium' ? 'amber' : 'blue'} className="mt-2">
                        {user?.profile?.subscription_tier === 'premium' ? 'Premium' : 'Free'} Plan
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-[family-name:var(--font-bubblegum-sans)] text-purple-600 dark:text-purple-400 mb-4">Account Information</h3>
                  <div className="space-y-3 pl-4 border-l-4 border-blue-200">
                    <Text><span className="font-medium">Email:</span> {user?.email}</Text>
                    <Text><span className="font-medium">Account ID:</span> <span className="text-sm font-mono">{user?.id}</span></Text>
                    <Text><span className="font-medium">Email Verified:</span> {user?.email_confirmed_at ? 'Yes' : 'No'}</Text>
                    <Text><span className="font-medium">Last Sign In:</span> {formatDate(user?.last_sign_in_at)}</Text>
                    <Text><span className="font-medium">Created:</span> {formatDate(user?.created_at)}</Text>
                  </div>
                </div>
                
                <Divider />
                
                <div className="mt-8">
                  <h3 className="text-xl font-[family-name:var(--font-bubblegum-sans)] text-purple-600 dark:text-purple-400 mb-4">Subscription</h3>
                  <div className="space-y-3 pl-4 border-l-4 border-blue-200">
                    <Text><span className="font-medium">Current Plan:</span> {user?.profile?.subscription_tier === 'premium' ? 'Premium' : 'Free'}</Text>
                    <Text><span className="font-medium">Status:</span> {user?.profile?.subscription_status || 'Active'}</Text>
                    {user?.profile?.subscription_tier !== 'premium' && (
                      <div className="mt-4">
                        <Button 
                          href="/subscription/upgrade"
                          className="bg-gradient-to-r from-amber-400 to-amber-500 text-white font-[family-name:var(--font-bubblegum-sans)] rounded-xl py-2 px-4 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          Upgrade to Premium
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => router.push('/')}
                    className="border border-blue-300 text-blue-600 hover:bg-blue-50 font-[family-name:var(--font-bubblegum-sans)] rounded-xl py-2 px-6 shadow-sm hover:shadow hover:scale-105 transition-all duration-300"
                  >
                    Back to Home
                  </Button>
                  
                  <Button
                    onClick={handleSignOut}
                    className="bg-gradient-to-r from-red-400 to-pink-500 text-white font-[family-name:var(--font-bubblegum-sans)] rounded-xl py-2 px-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 