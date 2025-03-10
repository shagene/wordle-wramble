'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LetterTile, HintButton } from '.';
import { 
  textToSpeech, 
  isApiKeySet, 
  setElevenLabsApiKey,
  getAvailableVoices,
  setSelectedVoice,
  getSelectedVoice,
  Voice
} from '../services/elevenlabs';
import type { ReactElement } from 'react';
import { Button } from '../components/button';

type LetterStatus = 'empty' | 'filled' | 'correct' | 'incorrect' | 'misplaced';



/**
 * WordleGame component - The core game mechanic for Wordle Wramble
 * Can be used both as a demo on the landing page and in the main game
 */
interface WordleGameProps {
  words?: string[];
  hints?: string[];
  isDemo?: boolean;
  onComplete?: (word: string, attempts: number) => void;
}

export const WordleGame = ({ 
  words = ['CAT', 'DOG', 'SUN', 'HAT', 'BUG'], 
  hints = [], 
  isDemo = false,
  onComplete
}: WordleGameProps): ReactElement => {
  // Create a persistent audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element on mount
  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      // Set up event listeners once
      audioRef.current.addEventListener('error', (event) => {
        const errorMessage = audioRef.current?.error 
          ? `Code: ${audioRef.current.error.code}` 
          : 'unknown error';
        console.error('Error playing audio from ElevenLabs:', errorMessage);
      });
      
      audioRef.current.addEventListener('playing', () => {
        console.log('Audio started playing from ElevenLabs');
      });
      
      audioRef.current.addEventListener('ended', () => {
        console.log('Audio playback completed');
      });
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        // We don't remove the element, just pause it
      }
    };
  }, []);
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

  // Game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [userArrangement, setUserArrangement] = useState<string[]>([]);
  const [placedIndices, setPlacedIndices] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [draggedLetter, setDraggedLetter] = useState<{ letter: string; index: number } | null>(null);
  const [letterStatuses, setLetterStatuses] = useState<LetterStatus[]>(
    Array(currentWord.length).fill('empty')
  );
  // Track overall game progress
  const [allWordsCompleted, setAllWordsCompleted] = useState(false);
  const [wordResults, setWordResults] = useState<{word: string, attempts: number, completed: boolean}[]>([]);
  
  // Voice selection state
  const [availableVoices, setAvailableVoices] = useState<Voice[]>(getAvailableVoices());
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(getSelectedVoice());
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  
  // Scramble the current word
  const scrambleWord = (word: string): string[] => {
    const letters = word.split('');
    // Fisher-Yates shuffle algorithm
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
  };
  
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
  

  
  // Use browser speech synthesis as a fallback
  const playFallbackAudio = useCallback(() => {
    console.log('Using fallback browser TTS for:', currentWord);
    
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }
    
    try {
      // Function to safely get voices and speak
      const speakWithVoices = () => {
        try {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          
          // Create and configure a new utterance
          const utterance = new SpeechSynthesisUtterance(currentWord);
          utterance.rate = 0.85;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          // Simple event handlers
          utterance.onstart = () => console.log('Browser speech started');
          utterance.onend = () => console.log('Browser speech ended');
          utterance.onerror = () => console.log('Browser speech error');
          
          // Try to select a good English voice if available
          const voices = window.speechSynthesis.getVoices();
          console.log(`Found ${voices.length} voices`);
          
          if (voices.length > 0) {
            const englishVoice = voices.find(voice => 
              voice.lang.includes('en-')
            );
            if (englishVoice) {
              utterance.voice = englishVoice;
              console.log('Using voice:', englishVoice.name);
            }
          }
          
          // Speak the word
          window.speechSynthesis.speak(utterance);
          console.log('Speech request sent for:', currentWord);
        } catch (innerError) {
          console.log('Error in speakWithVoices:', innerError);
        }
      };
      
      // Check if voices are already loaded
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Voices already loaded, speak immediately
        speakWithVoices();
      } else {
        // Wait for voices to load
        console.log('Waiting for voices to load...');
        window.speechSynthesis.onvoiceschanged = () => {
          console.log('Voices loaded, now speaking');
          speakWithVoices();
          // Remove the event handler to prevent multiple calls
          window.speechSynthesis.onvoiceschanged = null;
        };
        
        // Set a timeout in case onvoiceschanged never fires
        setTimeout(() => {
          if (window.speechSynthesis.onvoiceschanged) {
            console.log('Voices timeout reached, trying anyway');
            speakWithVoices();
            window.speechSynthesis.onvoiceschanged = null;
          }
        }, 1000);
      }
    } catch (error) {
      // Safely log the error without trying to stringify it
      console.error('Fallback speech synthesis error');
    }
  }, [currentWord]);
  
  // Play word pronunciation using ElevenLabs
  const playWordAudio = useCallback(async () => {
    console.log('Playing audio for word:', currentWord);
    
    // Check if API key is set, if not show modal
    if (!isApiKeySet()) {
      console.log('No ElevenLabs API key found, showing modal');
      setShowApiKeyModal(true);
      return;
    }
    
    // Make sure we have our persistent audio element
    if (!audioRef.current) {
      console.error('Audio element not initialized');
      return;
    }
    
    try {
      // Always use ElevenLabs for all words - more reliable than browser TTS
      const audioUrl = await textToSpeech(currentWord, undefined, true); // Force ElevenLabs API
      
      // If we still got browser-tts back, it means the service decided to use it
      if (audioUrl === 'browser-tts') {
        console.log('ElevenLabs service used browser TTS despite our preference');
        return;
      }
      
      if (!audioUrl) {
        console.warn('Failed to get audio from ElevenLabs, falling back to browser TTS');
        playFallbackAudio();
        return;
      }
      
      // Use our persistent audio element
      const audio = audioRef.current;
      
      // Create a promise that resolves when audio playback completes
      const playPromise = new Promise<void>((resolve) => {
        const onEnded = () => {
          resolve();
          audio.removeEventListener('ended', onEnded);
        };
        
        audio.addEventListener('ended', onEnded, { once: true });
        
        // Set a timeout in case the audio never plays or ends
        setTimeout(() => {
          if (audio.paused) {
            console.warn('Audio playback timed out');
            resolve(); // Resolve anyway to not block the UI
            audio.removeEventListener('ended', onEnded);
          }
        }, 5000); // 5 second timeout
      });
      
      // Stop any current playback
      audio.pause();
      
      // Set the source and load the audio
      audio.src = audioUrl;
      audio.load();
      
      try {
        // Try to play the audio
        await audio.play();
        console.log('Play command issued for ElevenLabs audio');
        
        // Wait for the play promise to resolve
        await playPromise;
      } catch (playError) {
        console.error('Error during audio playback:', 
                      playError instanceof Error ? playError.message : 'Unknown play error');
        playFallbackAudio();
      }
    } catch (error) {
      // Safe error logging without trying to stringify the error object
      console.error('Error with ElevenLabs audio:', 
                    error instanceof Error ? error.message : 'Unknown error');
      playFallbackAudio();
    }
  }, [currentWord, playFallbackAudio]);

  // Handle dragging a letter
  const handleDragStart = (e: React.DragEvent, letter: string, index: number): void => {
    e.dataTransfer.setData('letter', letter);
    e.dataTransfer.setData('index', index.toString());
    e.dataTransfer.setData('sourceType', placedIndices.includes(index) ? 'slot' : 'source');
    setDraggedLetter({ letter, index });
  };
  
  // Handle dropping a letter into a slot
  const handleDrop = (e: React.DragEvent, slotIndex: number): void => {
    e.preventDefault();
    const letter = e.dataTransfer.getData('letter');
    const sourceIndex = parseInt(e.dataTransfer.getData('index'));
    const sourceType = e.dataTransfer.getData('sourceType');
    
    const newArrangement = [...userArrangement];
    const newPlacedIndices = [...placedIndices];
    
    // If the target slot has a letter, handle the replacement
    if (userArrangement[slotIndex]) {
      const targetLetter = userArrangement[slotIndex];
      if (sourceType === 'slot') {
        // Swap between slots
        newArrangement[sourceIndex] = targetLetter;
        newArrangement[slotIndex] = letter;
      } else {
        // Move from source to occupied slot
        // Find the original index of the letter being replaced
        const replacedLetterOriginalIndex = scrambledLetters.findIndex(
          (l, idx) => l === targetLetter && placedIndices.includes(idx)
        );
        
        // Remove the replaced letter's index from placedIndices
        if (replacedLetterOriginalIndex !== -1) {
          const indexToRemove = newPlacedIndices.indexOf(replacedLetterOriginalIndex);
          if (indexToRemove !== -1) {
            newPlacedIndices.splice(indexToRemove, 1);
          }
        }
        
        // Place the new letter
        newArrangement[slotIndex] = letter;
        newPlacedIndices.push(sourceIndex);
      }
    } else {
      // Move to empty slot
      newArrangement[slotIndex] = letter;
      if (sourceType === 'slot') {
        newArrangement[sourceIndex] = '';
      } else {
        newPlacedIndices.push(sourceIndex);
      }
    }
    
    setUserArrangement(newArrangement);
    setPlacedIndices(newPlacedIndices);
    setDraggedLetter(null);
    
    // Check if the word is complete
    const isComplete = newArrangement.every(letter => letter !== '');
    if (isComplete) {
      const arranged = newArrangement.join('');
      if (arranged === currentWord) {
        setIsCorrect(true);
        setShowSuccess(true);
        void playWordAudio(); // Play the word when correct
        
        // Add current word result to our results array
        const newWordResults = [...wordResults, {word: currentWord, attempts: attempts + 1, completed: true}];
        setWordResults(newWordResults);
        
        // Save progress to localStorage with more detailed information
        try {
          if (typeof window !== 'undefined' && !isDemo) {
            // Get existing progress or initialize empty object
            const progress = JSON.parse(localStorage.getItem('wordleProgress') || '{}');
            
            // Get the current list ID from URL if available
            const urlParams = new URLSearchParams(window.location.search);
            const listId = urlParams.get('list') || 'unknown';
            
            // Update progress for this list and word
            if (!progress[listId]) {
              progress[listId] = {};
            }
            
            // Store more detailed information about the completion
            progress[listId][currentWord] = {
              completed: true,
              attempts: attempts + 1,
              timestamp: new Date().toISOString(),
              mastered: attempts + 1 <= 2, // Consider mastered if completed in 1-2 attempts
              stars: attempts + 1 === 1 ? 3 : attempts + 1 === 2 ? 2 : 1, // 3 stars for 1 attempt, 2 for 2, 1 for 3
            };
            
            // Save back to localStorage
            localStorage.setItem('wordleProgress', JSON.stringify(progress));
            
            // Also update total stats
            const stats = JSON.parse(localStorage.getItem('wordleStats') || '{}');
            stats.totalCompleted = (stats.totalCompleted || 0) + 1;
            stats.totalStars = (stats.totalStars || 0) + (attempts + 1 === 1 ? 3 : attempts + 1 === 2 ? 2 : 1);
            stats.lastPlayed = new Date().toISOString();
            localStorage.setItem('wordleStats', JSON.stringify(stats));
          }
        } catch (error) {
          console.error('Error saving progress:', error);
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
        const newStatuses: LetterStatus[] = newArrangement.map((letter, idx) => {
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
    }
  };
  
  // Allow dropping
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
  };
  
  // Reset a letter placement
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
  
  // Show hint and play audio
  const showHint = async (): Promise<void> => {
    if (hints[currentWordIndex]) {
      // Show the first letter
      const newArrangement = [...userArrangement];
      newArrangement[0] = currentWord[0];
      setUserArrangement(newArrangement);
      
      // Play the word pronunciation
      playWordAudio(); // Don't await this to avoid blocking
    }
  };
  

  
  // Calculate grade based on performance
  const calculateGrade = (results: {word: string, attempts: number, completed: boolean}[]): { grade: string, percentage: number } => {
    // Calculate points: 3 points for solving in 1 attempt, 2 for 2 attempts, 1 for 3 attempts, 0 for not solving
    const totalPossiblePoints = results.length * 3; // Max points possible
    
    const earnedPoints = results.reduce((sum, result) => {
      if (!result.completed) return sum; // No points for incomplete words
      
      // Points based on attempts
      switch(result.attempts) {
        case 1: return sum + 3; // Perfect - 3 points
        case 2: return sum + 2; // Good - 2 points
        case 3: return sum + 1; // Okay - 1 point
        default: return sum;    // Should not happen
      }
    }, 0);
    
    const percentage = Math.round((earnedPoints / totalPossiblePoints) * 100);
    
    // Assign letter grade based on percentage
    let grade;
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    else grade = 'F';
    
    return { grade, percentage };
  };

  // Results screen component
  const ResultsScreen = () => {
    const completedWords = wordResults.filter(result => result.completed);
    const { grade, percentage } = calculateGrade(wordResults);
    const bestWord = [...completedWords].sort((a, b) => a.attempts - b.attempts)[0];
    
    return (
      <div className="text-center">
        <h2 className="text-2xl font-[family-name:var(--font-bubblegum-sans)] text-blue-600 dark:text-blue-400 mb-6">
          Word List Complete! 🎉
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {completedWords.length}/{words.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Words Completed</div>
          </div>
          
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{grade}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Grade ({percentage}%)</div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2">Your Words:</h3>
          <ul className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            {wordResults.map((result, index) => (
              <li 
                key={index} 
                className={`flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-0 ${!result.completed ? 'text-red-500 dark:text-red-400' : ''}`}
              >
                <span className="font-medium">{result.word}</span>
                <span>
                  {result.completed 
                    ? `${result.attempts} ${result.attempts === 1 ? 'attempt' : 'attempts'}` 
                    : 'Not completed'}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        {bestWord && (
          <div className="mb-8 bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg inline-block">
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Best Word</div>
            <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
              {bestWord.word} ({bestWord.attempts} {bestWord.attempts === 1 ? 'attempt' : 'attempts'})
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <Button
            onClick={() => {
              // Reset game state
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
            }}
            color="green"
            className="text-white px-6 py-2"
          >
            Play Again
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
      {allWordsCompleted ? (
        <ResultsScreen />
      ) : isDemo ? (
        <h3 className="text-xl font-[family-name:var(--font-bubblegum-sans)] mb-4 text-blue-600 dark:text-blue-400">
          Try the Demo!
        </h3>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-[family-name:var(--font-bubblegum-sans)] text-blue-600 dark:text-blue-400">
            Word {currentWordIndex + 1} of {words.length}
          </h3>
          <div className="flex gap-2">
            {hints[currentWordIndex] && (
              <HintButton
                onClick={showHint}
                icon="💡"
                label="Show hint and pronunciation"
                color="amber"
              />
            )}
            <HintButton
              onClick={playWordAudio}
              icon="🔊"
              label="Play word pronunciation"
              color="blue"
            />
          </div>
        </div>
      )}
      
      {!allWordsCompleted && (
        <>
          {/* Drop area for letter arrangement */}
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: currentWord.length }).map((_, index) => (
              <LetterTile
                key={`slot-${index}`}
                letter={userArrangement[index] || ''}
                status={letterStatuses[index] || 'empty'}
                onDragStart={(e) => handleDragStart(e, userArrangement[index] || '', index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => handleSlotClick(index)}
                draggable={!!userArrangement[index]}
                isSlot
              />
            ))}
          </div>
          
          {/* Scrambled letters */}
          <div className="flex justify-center gap-2">
            {scrambledLetters.map((letter, index) => (
              <LetterTile
                key={`letter-${index}`}
                letter={placedIndices.includes(index) ? '' : letter}
                status="empty"
                draggable={!placedIndices.includes(index)}
                onDragStart={(e) => handleDragStart(e, letter, index)}
              />
            ))}
          </div>
          
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
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Enter ElevenLabs API Key</h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              To enable audio pronunciation, please enter your ElevenLabs API key.
              You can get a free API key by signing up at{' '}
              <a 
                href="https://elevenlabs.io" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline"
              >
                elevenlabs.io
              </a>
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter your API key"
              className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (apiKeyInput.trim()) {
                    setElevenLabsApiKey(apiKeyInput.trim());
                    setShowApiKeyModal(false);
                    // Try playing audio after setting the key
                    setTimeout(playWordAudio, 500);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!apiKeyInput.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


