'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/app/components/button";
import Link from 'next/link';
import { WordList } from './types';
import { GameHeader } from './components/GameHeader';
import { WordListGrid } from './components/WordListGrid';
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth';
import { useAuth } from '@/app/hooks/useAuth';
import { getUserWordLists } from '@/app/services/wordListService';
import { ROUTES, createRedirectUrl } from '@/app/lib/navigation/routes';

// Component to handle the temp ID parameter
function TempListHandler() {
  const router = useRouter();
  // Using useSearchParams correctly in Next.js 15
  const searchParams = useSearchParams();
  const tempId = searchParams.get('temp');
  
  // Check for temporary word list from shared link
  useEffect(() => {
    if (tempId) {
      try {
        // Try to load the temporary word list from session storage
        const tempListJson = sessionStorage.getItem('tempWordList');
        
        if (tempListJson) {
          const tempList = JSON.parse(tempListJson);
          
          // Validate that it's the correct temp list
          if (tempList.id === tempId) {
            // Navigate to the game with this list
            router.push(ROUTES.GAME.PLAY(tempList.id));
            return;
          }
        }
        
        // If we couldn't find the temp list in session storage,
        // redirect to the share page to handle the shared list properly
        router.push(ROUTES.HOME);
      } catch (error) {
        console.error('Error loading temporary word list:', error);
      }
    }
  }, [tempId, router]);
  
  return null;
}

export default function GamePage() {
  console.log('GamePage: Component rendering');
  const router = useRouter();
  
  // Use both auth hooks to ensure synchronization
  const { userId: supabaseUserId, isAuthenticated: supabaseIsAuthenticated, isLoading: supabaseAuthLoading } = useSupabaseAuth();
  const { user: authUser, session: authSession, isLoading: authLoading } = useAuth();

  console.log('GamePage: Auth states', {
    supabaseAuth: { userId: supabaseUserId, isAuthenticated: supabaseIsAuthenticated, isLoading: supabaseAuthLoading },
    originalAuth: { hasUser: !!authUser, hasSession: !!authSession, isLoading: authLoading }
  });
  
  // Determine the combined auth state
  const isAuthenticated = supabaseIsAuthenticated || !!authUser;
  const userId = supabaseUserId || (authUser?.id);
  const isAuthLoading = supabaseAuthLoading || authLoading;
  
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load word lists from Supabase
  const loadWordLists = useCallback(async () => {
    console.log('GamePage: loadWordLists running with auth state', {
      isAuthLoading,
      isAuthenticated,
      userId
    });
    
    // Wait for auth check to complete
    if (isAuthLoading) {
      console.log('GamePage: Still loading auth, waiting...');
      return;
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      console.log('GamePage: Not authenticated, redirecting to login');
      const returnUrl = ROUTES.GAME.HOME;
      router.push(createRedirectUrl(ROUTES.AUTH.LOGIN, returnUrl));
      return;
    }

    if (!userId) {
      console.log('GamePage: No userId despite being authenticated');
      setError('User ID not found. Please try logging in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('GamePage: Fetching word lists from Supabase for user', userId);
      const { data, error: fetchError } = await getUserWordLists(userId);
      
      if (fetchError) {
        console.error('GamePage: Error loading word lists:', fetchError);
        setError('Failed to load your word lists. Please try again.');
        setLoading(false);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('GamePage: No word lists found, redirecting to create page');
        router.push(`${ROUTES.WORDLIST.CREATE}?noLists=true`);
        return;
      }
      
      console.log('GamePage: Word lists loaded successfully:', data.length);
      setWordLists(data);
      setLoading(false);
    } catch (error) {
      console.error('GamePage: Error loading word lists:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }, [userId, isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    loadWordLists();
  }, [loadWordLists]);

  // Handle word list deletion and update state
  const handleWordListDeleted = async () => {
    console.log('GamePage: Word list deleted, refreshing lists...');
    
    try {
      // First reload the lists to get current state
      setLoading(true);
      
      if (!userId) {
        console.error('GamePage: Cannot refresh lists after deletion - no userId');
        return;
      }
      
      const { data, error } = await getUserWordLists(userId);
      
      if (error) {
        console.error('GamePage: Error refreshing lists after deletion:', error);
        setError('Failed to refresh your word lists.');
        setLoading(false);
        return;
      }
      
      setLoading(false);
      
      // If no lists left or only one that was just deleted, redirect to create page
      if (!data || data.length === 0) {
        console.log('GamePage: No lists remaining after deletion, redirecting to create page');
        router.push(`${ROUTES.WORDLIST.CREATE}?noLists=true`);
        return;
      }
      
      // Otherwise update the state with new list data
      console.log(`GamePage: Updated lists after deletion, found ${data.length} lists`);
      setWordLists(data);
    } catch (error) {
      console.error('GamePage: Unexpected error refreshing lists after deletion:', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <GameHeader 
        title="Choose a Wordle"
        backUrl={ROUTES.HOME}
        backText="Back to Home"
        showNewWordleButton={true}
      />
      
      {/* Wrap the component that uses useSearchParams in Suspense */}
      <Suspense fallback={null}>
        <TempListHandler />
      </Suspense>
      
      {isAuthLoading || loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Loading word lists...</p>
        </div>
      ) : error ? (
        <div className="py-8 max-w-md mx-auto w-full">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
          </div>
          <Button onClick={() => loadWordLists()} color="blue" className="w-full mt-4">
            Try Again
          </Button>
        </div>
      ) : wordLists.length === 0 ? (
        <div className="text-center py-8 max-w-md mx-auto">
          <p className="text-lg mb-6">You don&apos;t have any word lists yet!</p>
          <Link href={`${ROUTES.WORDLIST.CREATE}?noLists=true`}>
            <Button color="green" className="text-white">
              Create Your First List
            </Button>
          </Link>
        </div>
      ) : (
        <WordListGrid 
          wordLists={wordLists} 
          onDelete={handleWordListDeleted}
        />
      )}
    </div>
  );
}
