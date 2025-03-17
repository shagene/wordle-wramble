'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { WordleGame } from "../../ui";
import { Button } from "../../components/button";
import { WordList } from '../types';
import { GameHeader } from '../components/GameHeader';
import { GameProgress } from '../components/GameProgress';
import { GameProvider, useGameContext } from '../context/GameContext';
import Link from 'next/link';

type GamePageProps = {
  params: Promise<{
    listId: string;
  }>;
};

function GamePageContent({ params }: GamePageProps) {
  const router = useRouter();
  // Unwrap params using React.use() as required by Next.js
  const { listId } = use(params);
  const { setWordList, wordList } = useGameContext();
  const [loading, setLoading] = useState(true);

  // Load word list from localStorage or session storage (for shared lists)
  useEffect(() => {
    const loadWordList = () => {
      try {
        setLoading(true);
        
        // Check if we're in the browser environment before accessing storage
        if (typeof window !== 'undefined') {
          // Check if this is a temporary list from a shared link
          if (listId.startsWith('temp-')) {
            const tempListJson = sessionStorage.getItem('tempWordList');
            
            if (tempListJson) {
              const tempList = JSON.parse(tempListJson);
              
              // Validate that it's the correct temp list
              if (tempList.id === listId) {
                setWordList(tempList);
                setLoading(false);
                return;
              }
            }
            
            // If we couldn't find the temp list, redirect back
            router.push('/game');
            return;
          }
          
          // Otherwise, load from localStorage as usual
          const savedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
          
          // Find the list with the matching ID
          const list = savedLists.find((l: WordList) => l.id === listId);
          
          if (list) {
            setWordList(list);
          } else {
            // If list not found, redirect back to game selection
            router.push('/game');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading word list:', error);
        setLoading(false);
        router.push('/game');
      }
    };
    
    loadWordList();
  }, [listId, router, setWordList]);

  // Handle completing a word
  const handleCompleteWord = (word: string, attempts: number) => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined' || !wordList) return;
    
    try {
      // Skip progress tracking for temporary lists
      if (wordList.id.startsWith('temp-')) {
        return;
      }
      
      // Get existing progress from localStorage
      const progressJson = localStorage.getItem('wordleProgress') || '{}';
      const progress = JSON.parse(progressJson);
      
      // Initialize progress for this list if it doesn't exist
      if (!progress[wordList.id]) {
        progress[wordList.id] = {};
      }
      
      // Update progress for this word
      progress[wordList.id][word] = {
        completed: true,
        attempts,
        timestamp: new Date().toISOString()
      };
      
      // Save updated progress back to localStorage
      localStorage.setItem('wordleProgress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Save the temporary list to localStorage
  const saveTemporaryList = () => {
    if (!wordList || !wordList.id.startsWith('temp-')) return;
    
    try {
      // Get existing lists from localStorage
      const existingLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
      
      // Create a new list object with a unique ID
      const newList: WordList = {
        id: `shared-${Date.now()}`,
        name: `${wordList.name} (Shared)`,
        words: wordList.words,
        hints: wordList.hints || [],
        dateCreated: new Date().toISOString()
      };
      
      // Add the new list to existing lists
      const updatedLists = [...existingLists, newList];
      
      // Save back to localStorage
      localStorage.setItem('wordLists', JSON.stringify(updatedLists));
      
      // Show a success message
      alert('List saved successfully! You can find it in your collection.');
    } catch (error) {
      console.error('Error saving list:', error);
      alert('Failed to save the list. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <GameHeader 
          title="Loading..."
          backUrl="/game"
          backText="Back to Lists"
        />
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Loading word list...</p>
        </div>
      </div>
    );
  }

  if (!wordList) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <GameHeader 
          title="Not Found"
          backUrl="/game"
          backText="Back to Lists"
        />
        <div className="text-center py-8 max-w-md mx-auto">
          <p className="text-lg mb-6">Word list not found.</p>
          <Link href="/game">
            <Button color="blue">
              Back to Word Lists
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <GameHeader 
        title={wordList.name}
        backUrl="/game"
        backText="Back to Lists"
      />
      
      {/* Show a notice for temporary lists */}
      {wordList.id.startsWith('temp-') && (
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg mb-6 max-w-md text-center">
          <p>You&apos;re playing a shared word list. Your progress won&apos;t be saved.</p>
          <p className="text-sm mt-1">
            <Button 
              color="yellow" 
              onClick={saveTemporaryList}
              className="text-xs mt-2"
            >
              Save & Continue Playing
            </Button>
          </p>
        </div>
      )}
      
      {/* Don't show progress for temporary lists */}
      {!wordList.id.startsWith('temp-') && (
        <GameProgress wordList={wordList} />
      )}
      
      <div className="w-full max-w-2xl mx-auto mb-8">
        <WordleGame 
          words={wordList.words} 
          hints={wordList.hints} 
          onComplete={(word, attempts) => handleCompleteWord(word, attempts)}
        />
      </div>
    </div>
  );
}

export default function Page({ params }: GamePageProps) {
  return (
    <GameProvider>
      <GamePageContent params={params} />
    </GameProvider>
  );
}
