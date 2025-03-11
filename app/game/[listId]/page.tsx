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

  // Load word list from localStorage
  useEffect(() => {
    const loadWordList = () => {
      try {
        setLoading(true);
        
        // Check if we're in the browser environment before accessing localStorage
        if (typeof window !== 'undefined') {
          // Load saved lists from localStorage
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
  }, [listId, router]);

  // Handle completing a word
  const handleCompleteWord = (word: string, attempts: number) => {
    console.log(`Completed word: ${word} in ${attempts} attempts`);
    
    // Save progress to localStorage
    try {
      if (typeof window !== 'undefined' && wordList) {
        // Get existing progress or initialize empty object
        const progress = JSON.parse(localStorage.getItem('wordleProgress') || '{}');
        
        // Initialize list progress if it doesn't exist
        if (!progress[wordList.id]) {
          progress[wordList.id] = { completed: 0, attempts: 0 };
        }
        
        // Track individual word completion
        if (!progress[wordList.id].words) {
          progress[wordList.id].words = {};
        }
        
        // Only count as completed if it wasn't already completed
        if (!progress[wordList.id].words[word] || !progress[wordList.id].words[word].completed) {
          progress[wordList.id].completed += 1;
        }
        
        // Always increment attempts
        progress[wordList.id].attempts += 1;
        
        // Store details for this specific word
        progress[wordList.id].words[word] = {
          completed: true,
          attempts,
          timestamp: new Date().toISOString()
        };
        
        // Save back to localStorage
        localStorage.setItem('wordleProgress', JSON.stringify(progress));
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
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
        <div className="text-center py-8 max-w-md mx-auto">
          <p className="text-lg mb-6">Word list not found.</p>
          <Button 
            color="blue"
            onClick={() => router.push('/game')}
          >
            Back to Wordles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <GameHeader 
        title={wordList.name}
        backUrl="/game"
        backText="Back to Wordles"
        showNewWordleButton={false}
      />
      
      {wordList && <GameProgress wordList={wordList} />}
      
      <div className="w-full max-w-2xl mx-auto mb-8">
        <WordleGame 
          words={wordList.words} 
          hints={wordList.hints} 
          isDemo={false}
          onComplete={(word, attempts) => handleCompleteWord(word, attempts)}
        />
      </div>
    </div>
  );
}

export function GamePage({ params }: GamePageProps) {
  return (
    <GameProvider>
      <GamePageContent params={params} />
    </GameProvider>
  );
}

export default GamePage;
