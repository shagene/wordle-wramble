'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Button } from './button';

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    }

    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="bg-amber-600 text-white p-2 flex justify-between items-center">
      <div className="font-semibold text-white">Wordle Wramble</div>
      
      <div className="flex space-x-4 items-center">
        {loading ? (
          <div className="text-sm text-white">Loading...</div>
        ) : user ? (
          <>
            <div className="text-sm hidden sm:inline text-white">{user.email}</div>
            <Button color="light" href="/auth/profile" className="text-sm">
              Profile
            </Button>
            <Button 
              color="white"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button outline href="/auth/login" className="text-white">
              Sign In
            </Button>
            <Button color="white" href="/auth/signup">
              Sign Up
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 