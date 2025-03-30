'use client';

import { useSupabaseAuth } from './useSupabaseAuth';
import { useState, useEffect } from 'react';
import { getWordList } from '@/app/services/wordListService';

interface GameAccessResult {
  canAccess: boolean;
  isLoading: boolean;
  error: string | null;
  wordListId: string | null;
}

/**
 * Hook to check if a user can access a specific game (word list)
 */
export function useGameAccess(listId: string): GameAccessResult {
  const { userId, isLoading: authLoading, isAuthenticated } = useSupabaseAuth();
  const [canAccess, setCanAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Reset states
        setError(null);
        setCanAccess(false);
        setIsLoading(true);

        // Wait for auth check to complete
        if (authLoading) {
          return;
        }

        // If not authenticated, they can't access
        if (!isAuthenticated || !userId) {
          console.log('Game access denied: User not authenticated');
          setError('You must be logged in to access this game');
          setIsLoading(false);
          return;
        }

        // Check if word list exists and user has access
        const { data: wordList, error: listError } = await getWordList(listId, userId);

        if (listError) {
          console.error('Error checking word list access:', listError);
          setError('Failed to verify access to this word list');
          setIsLoading(false);
          return;
        }

        if (!wordList) {
          console.log('Game access denied: Word list not found');
          setError('Word list not found');
          setIsLoading(false);
          return;
        }

        // Verify ownership or public status
        if (wordList.user_id !== userId && !wordList.is_public) {
          console.log('Game access denied: User does not own this private list');
          setError('You do not have access to this word list');
          setIsLoading(false);
          return;
        }

        // All checks passed
        console.log('Game access granted');
        setCanAccess(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Unexpected error checking game access:', err);
        setError('An error occurred while checking access');
        setCanAccess(false);
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [listId, userId, authLoading, isAuthenticated]);

  return {
    canAccess,
    isLoading: isLoading || authLoading,
    error,
    wordListId: listId
  };
} 