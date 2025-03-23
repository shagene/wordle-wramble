'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

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
      <div className="font-bold">Wordle Wramble</div>
      
      <div className="flex space-x-4 items-center">
        {loading ? (
          <span className="text-sm">Loading...</span>
        ) : user ? (
          <>
            <span className="text-sm hidden sm:inline">{user.email}</span>
            <Link href="/auth/profile" className="text-sm hover:underline">
              Profile
            </Link>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="text-sm px-2 py-1 bg-white text-amber-700 rounded hover:bg-amber-100"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="text-sm hover:underline">
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="text-sm px-2 py-1 bg-white text-amber-700 rounded hover:bg-amber-100"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
} 