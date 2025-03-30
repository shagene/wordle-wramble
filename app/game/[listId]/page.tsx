'use client';

import { useEffect, useState } from 'react';
import { WordleGame } from "../../ui";
import { Button } from "../../components/button";
import { GameHeader } from '../components/GameHeader';
import { GameProvider, useGameContext } from '../context/GameContext';
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth';
import { useGameAccess } from '@/app/hooks/useGameAccess';
import { getWordList, updateWordProgress } from '@/app/services/wordListService';
import Link from 'next/link';
import { ROUTES } from '@/app/lib/navigation/routes';
import { use } from 'react';

type GamePageProps = {
  params: Promise<{
    listId: string;
  }>;
};

function GamePageContent(props: GamePageProps) {
  // Using React.use() to unwrap the params Promise
  const { listId } = use(props.params);
  
  const { userId } = useSupabaseAuth();
  const { setWordList, wordList } = useGameContext();
  const { canAccess, isLoading: accessLoading, error: accessError } = useGameAccess(listId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load word list from Supabase once we have access
  useEffect(() => {
    const loadWordList = async () => {
      // Don't load if we're still checking access or don't have access
      if (accessLoading || !canAccess || !userId) return;

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching word list from Supabase');
        const { data, error: fetchError } = await getWordList(listId, userId);
        
        if (fetchError) {
          console.error('Error loading word list:', fetchError);
          setError('Failed to load the word list. Please try again.');
          return;
        }
        
        if (!data) {
          console.log('Word list not found');
          setError('Word list not found.');
          return;
        }
        
        console.log('Word list loaded successfully:', data);
        setWordList(data);
      } catch (error) {
        console.error('Error loading word list:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadWordList();
  }, [userId, listId, canAccess, accessLoading, setWordList]);

  // Handle completing a word
  const handleCompleteWord = async (word: string, attempts: number) => {
    if (!userId || !wordList) return;
    
    try {
      console.log('Updating word progress:', { word, attempts });
      // Update progress in Supabase
      await updateWordProgress({
        userId,
        listId: wordList.id,
        word,
        attempts,
        completed: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Handle access denied errors
  if (accessError && !accessLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <GameHeader 
          title="Access Denied"
          backUrl={ROUTES.GAME.HOME}
          backText="Back to Lists"
        />
        <div className="text-center py-8 max-w-md mx-auto">
          <p className="text-lg mb-6">{accessError}</p>
          <Link href={ROUTES.AUTH.LOGIN}>
            <Button color="blue">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state
  if (accessLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <GameHeader 
          title="Loading..."
          backUrl={ROUTES.GAME.HOME}
          backText="Back to Lists"
        />
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Loading word list...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !wordList) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <GameHeader 
          title="Error"
          backUrl={ROUTES.GAME.HOME}
          backText="Back to Lists"
        />
        <div className="text-center py-8 max-w-md mx-auto">
          <p className="text-lg mb-6">{error || 'Word list not found.'}</p>
          <Link href={ROUTES.GAME.HOME}>
            <Button color="blue">
              Back to Word Lists
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show the game
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <GameHeader 
        title={wordList.name}
        backUrl={ROUTES.GAME.HOME}
        backText="Back to Lists"
      />
      
      <div className="w-full max-w-lg mx-auto">
        <WordleGame 
          words={wordList.words}
          hints={wordList.hints || []}
          onComplete={handleCompleteWord}
        />
      </div>
    </div>
  );
}

export default function GamePage(props: GamePageProps) {
  return (
    <GameProvider>
      <GamePageContent {...props} />
    </GameProvider>
  );
}
