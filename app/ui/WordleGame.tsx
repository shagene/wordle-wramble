'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGameContext } from '../game/context/GameContext';
import { LetterTile, HintButton } from '.';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { Button } from '../components/button';

// Import our refactored components
import {
  useAudioService, // This now uses the AudioServiceWrapper
  ApiKeyModal,
  DragAndDrop,
  ResultsScreen,
  VoiceSelector,
  scrambleWord,
  saveProgress,
  type LetterStatus,
  type WordResult,
  type WordleGameProps
} from './game-components';

export function WordleGame({ 
  words = ['CAT', 'DOG', 'SUN', 'HAT', 'BUG'], 
  hints = [], 
  isDemo = false,
  onComplete
}: WordleGameProps): ReactElement {
  const router = useRouter();
  const { currentWordIndex, setCurrentWordIndex } = useGameContext();
  
  // Game state
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [userArrangement, setUserArrangement] = useState<string[]>([]);
  const [placedIndices, setPlacedIndices] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [letterStatuses, setLetterStatuses] = useState<LetterStatus[]>([]);
  const [allWordsCompleted, setAllWordsCompleted] = useState(false);
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // Use our audio service hook with enhanced voice selection functionality
  const { 
    playWordAudio, 
    isApiKeySet, 
    setElevenLabsApiKey,
    voices,
    selectedVoiceId,
    handleVoiceSelection,
    refreshVoices
  } = useAudioService();
  
  // Return early if no words are available
  if (!words.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No words available. Please add some words to play!
        </p>
      </div>
    );
  }

  const MAX_ATTEMPTS = 3;
  
  // Initialize the game with a scrambled word
  useEffect(() => {
    if (currentWord) {
      const scrambled = scrambleWord(currentWord);
      setScrambledLetters(scrambled);
      setUserArrangement(Array(scrambled.length).fill(''));
      setPlacedIndices([]);
      setIsCorrect(false);
      setShowSuccess(false);
      setAttempts(0);
      setLetterStatuses(Array(currentWord.length).fill('empty'));
    }
  }, [currentWord]);
  
  // Display attempts counter with max attempts
  const renderAttemptsCounter = () => {
    return (
      <div className="mt-4 text-gray-600 dark:text-gray-400">
        Attempts: {attempts}/{MAX_ATTEMPTS}
      </div>
    );
  };
  
  // Store audio cleanup functions
  const [audioCleanup, setAudioCleanup] = useState<(() => void) | undefined>();

  // Cleanup audio when component unmounts or when currentWord changes
  useEffect(() => {
    return () => {
      // Call the cleanup function if it exists
      if (audioCleanup) {
        audioCleanup();
      }
    };
  }, [audioCleanup]);

  // Show hint and play audio
  const showHint = async (): Promise<void> => {
    if (hints[currentWordIndex]) {
      // Show the first letter
      const newArrangement = [...userArrangement];
      newArrangement[0] = currentWord[0];
      setUserArrangement(newArrangement);
      
      // Cleanup previous audio if exists
      if (audioCleanup) {
        audioCleanup();
      }
      
      // Play the word pronunciation and store the cleanup function
      const cleanupPromise = playWordAudio(currentWord, () => setShowApiKeyModal(true));
      cleanupPromise.then(cleanup => {
        if (cleanup) setAudioCleanup(cleanup);
      });
    }
  };
  
  // Handle slot click
  const handleSlotClick = (slotIndex: number): void => {
    if (userArrangement[slotIndex]) {
      // Find which original letter this was
      const letterToReset = userArrangement[slotIndex];
      const originalIndex = scrambledLetters.findIndex(
        (letter: string, index: number) => letter === letterToReset && placedIndices.includes(index)
      );
      
      // Remove from placed indices
      setPlacedIndices(placedIndices.filter((index: number) => index !== originalIndex));
      
      // Clear the slot
      const newArrangement = [...userArrangement];
      newArrangement[slotIndex] = '';
      setUserArrangement(newArrangement);
      
      // Reset the letter status
      const newStatuses = [...letterStatuses];
      newStatuses[slotIndex] = 'empty';
      setLetterStatuses(newStatuses);
    }
  };
  
  // Handle arrangement change from DragAndDrop component
  const handleArrangementChange = (newArrangement: string[], newPlacedIndices: number[]) => {
    setUserArrangement(newArrangement);
    setPlacedIndices(newPlacedIndices);
  };
  
  // Handle word completion
  const handleWordComplete = (isCorrect: boolean) => {
    if (isCorrect) {
      setIsCorrect(true);
      setShowSuccess(true);
      
      // Cleanup previous audio if exists
      if (audioCleanup) {
        audioCleanup();
      }
      
      // Play the word pronunciation and store the cleanup function
      const cleanupPromise = playWordAudio(currentWord, () => setShowApiKeyModal(true));
      cleanupPromise.then(cleanup => {
        if (cleanup) setAudioCleanup(cleanup);
      });
      
      // Add current word result to our results array
      const newWordResults = [...wordResults, {word: currentWord, attempts: attempts + 1, completed: true}];
      setWordResults(newWordResults);
      
      // Save progress to localStorage
      if (!isDemo) {
        const urlParams = new URLSearchParams(window.location.search);
        const listId = urlParams.get('list') || 'unknown';
        saveProgress(listId, currentWord, attempts + 1, isDemo);
      }
      
      if (onComplete) {
        onComplete(currentWord, attempts + 1);
      }
      
      if (isDemo) {
        // For demo mode, just cycle through words
        setTimeout(() => {
          const nextIndex = (currentWordIndex + 1) % words.length;
          setCurrentWordIndex(nextIndex);
          setCurrentWord(words[nextIndex]);
        }, 2000);
      } else if (currentWordIndex < words.length - 1) {
        // Move to next word in the list
        setTimeout(() => {
          const nextIndex = currentWordIndex + 1;
          setCurrentWordIndex(nextIndex);
          setCurrentWord(words[nextIndex]);
        }, 2000);
      } else {
        // All words completed, show results screen
        setTimeout(() => {
          setAllWordsCompleted(true);
        }, 2000);
      }
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      // Update letter statuses for feedback
      const newStatuses: LetterStatus[] = userArrangement.map((letter, idx) => {
        if (letter === currentWord[idx]) return 'correct';
        return 'incorrect';
      });
      setLetterStatuses(newStatuses);
      
      // Check if max attempts reached
      if (newAttempts >= MAX_ATTEMPTS) {
        // Add current word to results as incomplete
        const newWordResults = [...wordResults, {word: currentWord, attempts: newAttempts, completed: false}];
        setWordResults(newWordResults);
        
        if (onComplete) {
          onComplete(currentWord, newAttempts);
        }
        
        // Show feedback that max attempts were reached
        setTimeout(() => {
          if (currentWordIndex < words.length - 1) {
            // Move to next word
            const nextIndex = currentWordIndex + 1;
            setCurrentWordIndex(nextIndex);
            setCurrentWord(words[nextIndex]);
          } else {
            // All words attempted, show results
            setAllWordsCompleted(true);
          }
        }, 2000);
      } else {
        // Reset for next attempt
        setTimeout(() => {
          setUserArrangement(Array(currentWord.length).fill(''));
          setPlacedIndices([]);
          setLetterStatuses(Array(currentWord.length).fill('empty'));
        }, 1500);
      }
    }
  };
  
  // Handle API key save
  const handleApiKeySave = (apiKey: string) => {
    setElevenLabsApiKey(apiKey);
    setShowApiKeyModal(false);
    // Try playing audio after setting the key
    setTimeout(() => {
      // Cleanup previous audio if exists
      if (audioCleanup) {
        audioCleanup();
      }
      
      // Play the word pronunciation and store the cleanup function
      const cleanupPromise = playWordAudio(currentWord, () => setShowApiKeyModal(true));
      cleanupPromise.then(cleanup => {
        if (cleanup) setAudioCleanup(cleanup);
      });
    }, 500);
  };
  
  // Reset game state
  const handleReset = () => {
    setAllWordsCompleted(false);
    setWordResults([]);
    setCurrentWordIndex(0);
    setCurrentWord(words[0]);
    // Reset other game state variables
    setScrambledLetters(scrambleWord(words[0]));
    setUserArrangement(Array(words[0].length).fill(''));
    setPlacedIndices([]);
    setIsCorrect(false);
    setShowSuccess(false);
    setAttempts(0);
    setLetterStatuses(Array(words[0].length).fill('empty'));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
      {allWordsCompleted ? (
        <ResultsScreen 
          words={words}
          wordResults={wordResults}
          onReset={handleReset}
        />
      ) : isDemo ? (
        <h3 className="text-xl font-[family-name:var(--font-bubblegum-sans)] mb-4 text-blue-600 dark:text-blue-400">
          Try the Demo!
        </h3>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-[family-name:var(--font-bubblegum-sans)] text-blue-600 dark:text-blue-400">
            Word {currentWordIndex + 1} of {words.length}
          </h3>
          <div className="flex gap-2 items-center">
            {hints[currentWordIndex] && (
              <HintButton
                onClick={showHint}
                icon="💡"
                label="Show hint and pronunciation"
                color="amber"
              />
            )}
            <HintButton
              onClick={() => {
                // Cleanup previous audio if exists
                if (audioCleanup) {
                  audioCleanup();
                }
                
                // Play the word pronunciation and store the cleanup function
                const cleanupPromise = playWordAudio(currentWord, () => setShowApiKeyModal(true));
                cleanupPromise.then(cleanup => {
                  if (cleanup) setAudioCleanup(cleanup);
                });
              }}
              icon="🔊"
              label="Play word pronunciation"
              color="blue"
            />
            {isApiKeySet() && (
              <VoiceSelector
                voices={voices}
                selectedVoiceId={selectedVoiceId}
                onVoiceSelect={handleVoiceSelection}
                onRefreshVoices={refreshVoices}
                isApiKeySet={isApiKeySet}
              />
            )}
          </div>
        </div>
      )}
      
      {!allWordsCompleted && (
        <>
          <DragAndDrop
            currentWord={currentWord}
            scrambledLetters={scrambledLetters}
            userArrangement={userArrangement}
            placedIndices={placedIndices}
            letterStatuses={letterStatuses}
            onArrangementChange={handleArrangementChange}
            onComplete={handleWordComplete}
            onSlotClick={handleSlotClick}
          />
          
          {/* Success message */}
          {showSuccess && (
            <div className="mt-4 text-green-600 dark:text-green-400 font-bold animate-bounce">
              Great job! 🎉
            </div>
          )}
          
          {/* Attempts counter - only show in full game mode */}
          {!isDemo && renderAttemptsCounter()}
        </>
      )}
      
      {/* ElevenLabs API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
      />
      
      {/* Voice selection info - only shown when API key is set and not in results screen */}
      {isApiKeySet() && !allWordsCompleted && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <p>
            {isDemo
              ? 'In the full game, you can play pronunciations and choose different voices using the selector above.'
              : 'You can change the voice used for pronunciation using the voice selector above.'
            }
          </p>
        </div>
      )}
    </div>
  );
}