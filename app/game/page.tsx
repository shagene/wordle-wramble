'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "../components/button";
import Link from 'next/link';
import { WordList } from './types';
import { GameHeader } from './components/GameHeader';
import { WordListGrid } from './components/WordListGrid';
import { GameProvider } from './context/GameContext';

// Component to handle the temp ID parameter
function TempListHandler() {
  const router = useRouter();
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
            router.push(`/game/${tempList.id}`);
            return;
          }
        }
        
        // If we couldn't find the temp list in session storage,
        // redirect to the share page to handle the shared list properly
        router.push('/');
      } catch (error) {
        console.error('Error loading temporary word list:', error);
      }
    }
  }, [tempId, router]);
  
  return null;
}

function GamePageContent() {
  const router = useRouter();
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [loading, setLoading] = useState(true);

  // Load word lists from localStorage
  useEffect(() => {
    const loadWordLists = () => {
      try {
        setLoading(true);
        
        // Check if we're in the browser environment before accessing localStorage
        if (typeof window !== 'undefined') {
          // Load saved lists from localStorage
          const savedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
          
          setWordLists(savedLists);
          
          // If no lists exist, redirect to add words page with query parameter
          if (savedLists.length === 0) {
            router.push('/wordlist/create?noLists=true');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading word lists:', error);
        setWordLists([]);
        setLoading(false);
      }
    };
    
    loadWordLists();
  }, [router]);

  // Handle selecting a word list
  const handleSelectList = (list: WordList) => {
    // Navigate to the game page for this list
    router.push(`/game/${list.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <GameHeader 
        title="Choose a Wordle"
        backUrl="/"
        backText="Back to Home"
        showNewWordleButton={true}
      />
      
      {/* Wrap the component that uses useSearchParams in Suspense */}
      <Suspense fallback={null}>
        <TempListHandler />
      </Suspense>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Loading word lists...</p>
        </div>
      ) : wordLists.length === 0 ? (
        <div className="text-center py-8 max-w-md mx-auto">
          <p className="text-lg mb-6">You don&apos;t have any word lists yet!</p>
          <Link href="/wordlist/create?noLists=true">
            <Button color="green" className="text-white">
              Create Your First List
            </Button>
          </Link>
        </div>
      ) : (
        <WordListGrid 
          wordLists={wordLists}
          onSelectList={handleSelectList}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <GameProvider>
      <GamePageContent />
    </GameProvider>
  );
}
