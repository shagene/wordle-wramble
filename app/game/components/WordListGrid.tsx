'use client';

import { useState, useEffect } from 'react';
import { WordList } from '../types';
import { WordListCard } from './WordListCard';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/lib/navigation/routes';
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth';

type WordListGridProps = {
  wordLists: WordList[];
  onDelete?: () => void;
};

export function WordListGrid({ wordLists, onDelete }: WordListGridProps) {
  const router = useRouter();
  const { userId } = useSupabaseAuth();
  const [lists, setLists] = useState<WordList[]>([]);
  
  // Initialize state from props when component mounts or props change
  useEffect(() => {
    console.log('WordListGrid: Updating lists from props:', wordLists.length);
    setLists(wordLists);
  }, [wordLists]);
  
  // Navigate to the selected word list's game page
  const handleListClick = (list: WordList) => {
    if (!userId) {
      // If no user ID, redirect to login with return URL
      const returnUrl = ROUTES.GAME.PLAY(list.id);
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // If we have a user ID, navigate to the game
    router.push(ROUTES.GAME.PLAY(list.id));
  };
  
  // Handle list deletion by removing it from state
  const handleListDelete = (listId: string) => {
    console.log('WordListGrid: Removing list from UI state:', listId);
    setLists(prevLists => {
      const updatedLists = prevLists.filter(list => list.id !== listId);
      console.log(`WordListGrid: Lists reduced from ${prevLists.length} to ${updatedLists.length}`);
      return updatedLists;
    });
    
    // Call the parent's onDelete handler if provided
    if (onDelete) {
      console.log('WordListGrid: Notifying parent component of deletion');
      onDelete();
    }
  };
  
  // If no lists, render a message instead
  if (!lists?.length) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-lg text-gray-500 dark:text-gray-400">No word lists found.</p>
        <p className="mt-2 text-gray-400 dark:text-gray-500">
          Create a new list to get started.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl mx-auto py-8">
      {lists.map(list => (
        <WordListCard 
          key={list.id} 
          list={list} 
          onClick={() => handleListClick(list)}
          onDelete={handleListDelete}
        />
      ))}
    </div>
  );
}
