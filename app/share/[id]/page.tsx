'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heading } from '../../components/heading';
import { Button } from '../../components/button';
import Link from 'next/link';
import { decodeWordList, saveSharedWordList, createTempWordList } from '../../services/shareService';

type SharedListData = {
  name: string;
  words: string[];
  hints?: string[];
};

export default function SharedListPage() {
  const params = useParams();
  const router = useRouter();
  const [sharedList, setSharedList] = useState<SharedListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSharedList = () => {
      try {
        setLoading(true);
        
        if (!params.id) {
          setError('No shared list ID found');
          setLoading(false);
          return;
        }
        
        // Decode the shared list data using our utility function
        const decodedData = decodeWordList(params.id as string);
        
        if (!decodedData) {
          setError('Invalid shared list data');
          setLoading(false);
          return;
        }
        
        setSharedList(decodedData);
        setLoading(false);
      } catch (error) {
        console.error('Error decoding shared list:', error);
        setError('Could not decode the shared list. The link might be invalid or corrupted.');
        setLoading(false);
      }
    };
    
    loadSharedList();
  }, [params.id]);

  // Save the shared list to the user's localStorage
  const saveToMyLists = useCallback(() => {
    try {
      if (!sharedList) return null;
      
      // Save the shared list using our utility function
      const savedListId = saveSharedWordList(sharedList);
      
      setSaved(true);
      
      return savedListId;
    } catch (error) {
      console.error('Error saving shared list:', error);
      setError('Failed to save the list. Please try again.');
      return null;
    }
  }, [sharedList, setError]);

  // Play the shared list directly
  const playSharedList = useCallback(() => {
    if (!sharedList) return;
    
    // Create a temporary list using our utility function
    const tempList = createTempWordList(sharedList);
    
    // Store in session storage (will be cleared when browser is closed)
    sessionStorage.setItem('tempWordList', JSON.stringify(tempList));
    
    // Navigate to the game page with a special query parameter
    router.push(`/game?temp=${tempList.id}`);
  }, [sharedList, router]);

  // Save and play the shared list
  const saveAndPlayList = useCallback(() => {
    if (!sharedList) return;
    
    // First save the list
    const savedListId = saveToMyLists();
    
    // Then navigate to play the saved list (if saving was successful)
    if (savedListId) {
      router.push(`/game/${savedListId}`);
    } else {
      // Fallback to playing as a temporary list if saving failed
      playSharedList();
    }
  }, [sharedList, saveToMyLists, playSharedList, router]);

  // Auto-play if this is the first time loading the app
  useEffect(() => {
    // Check if this is likely a first-time visitor
    const isFirstVisit = typeof window !== 'undefined' && 
                         !localStorage.getItem('wordLists') && 
                         !sessionStorage.getItem('visitedBefore');
    
    // If it's a first visit and we have a valid shared list, auto-play after a short delay
    if (isFirstVisit && sharedList && !loading && !error) {
      // Mark that they've visited before
      sessionStorage.setItem('visitedBefore', 'true');
      
      // Auto-play after a short delay to let them see what's happening
      const timer = setTimeout(() => {
        // For first-time visitors, save and play to give them their first list
        saveAndPlayList();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [sharedList, loading, error, saveAndPlayList]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-purple-600 dark:text-purple-400">
        Shared Word List
      </Heading>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent mx-auto mb-4"></div>
            <p>Loading shared word list...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/">
              <Button color="blue" className="font-[family-name:var(--font-bubblegum-sans)]">
                Go Home
              </Button>
            </Link>
          </div>
        ) : sharedList ? (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-center">{sharedList.name}</h2>
            <p className="text-center mb-4 text-gray-500 dark:text-gray-400">
              {sharedList.words.length} words
            </p>
            
            {/* First-time visitor message */}
            {typeof window !== 'undefined' && !localStorage.getItem('wordLists') && (
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-3 rounded-lg mb-4 text-center">
                <p>Welcome to Wordle Wramble! You can play this shared list right away.</p>
              </div>
            )}
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Preview:</h3>
              <div className="flex flex-wrap gap-2">
                {sharedList.words.slice(0, 5).map((word, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 px-3 py-1 rounded-md text-sm">
                    {word}
                  </div>
                ))}
                {sharedList.words.length > 5 && (
                  <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-md text-sm">
                    +{sharedList.words.length - 5} more
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {saved ? (
                <Button 
                  color="green" 
                  onClick={playSharedList}
                  className="w-full font-[family-name:var(--font-bubblegum-sans)]"
                >
                  Play This Wordle
                </Button>
              ) : (
                <>
                  <Button 
                    color="green" 
                    onClick={saveAndPlayList}
                    className="w-full font-[family-name:var(--font-bubblegum-sans)]"
                  >
                    Save & Play Wordle
                  </Button>
                  
                  <Button 
                    color="blue" 
                    onClick={playSharedList}
                    className="w-full font-[family-name:var(--font-bubblegum-sans)]"
                  >
                    Play Without Saving
                  </Button>
                </>
              )}
              
              {saved && (
                <p className="text-green-600 dark:text-green-400 text-center py-2">
                  ✓ List saved to your collection!
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
      
      <div className="flex gap-4">
        <Button color="blue" href="/" className="font-[family-name:var(--font-bubblegum-sans)]">
          Back to Home
        </Button>
      </div>
    </div>
  );
} 