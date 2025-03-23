'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        
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
        setUser(session.user);
        
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
          setUser((prev: any) => ({ ...prev, profile }));
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
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6 text-amber-600">Your Profile</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-amber-600">Loading profile...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p>{error}</p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
              <pre className="whitespace-pre-wrap overflow-auto text-xs bg-gray-100 dark:bg-gray-600 p-3 rounded">
                {JSON.stringify({
                  user: {
                    id: user?.id,
                    email: user?.email,
                    emailConfirmed: user?.email_confirmed_at ? 'Yes' : 'No',
                    lastSignIn: user?.last_sign_in_at
                  },
                  profile: user?.profile || 'No profile data found',
                  aud: user?.aud,
                  role: user?.role,
                }, null, 2)}
              </pre>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-3">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Account ID:</span> {user?.id}</p>
                <p><span className="font-medium">Subscription:</span> {user?.profile?.subscription_tier || 'Free'}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back to Home
              </button>
              
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 