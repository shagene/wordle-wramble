'use client';

import { useState, useEffect } from 'react';

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

const WordleGame = ({ 
  words = ['CAT', 'DOG', 'SUN', 'HAT', 'BUG'], 
  hints = [], 
  isDemo = false,
  onComplete
}: WordleGameProps) => {
  // Game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [userArrangement, setUserArrangement] = useState<string[]>([]);
  const [placedIndices, setPlacedIndices] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  // Scramble the current word
  const scrambleWord = (word: string) => {
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
    }
  }, [currentWord]);
  
  // Handle dragging a letter
  const handleDragStart = (e: React.DragEvent, letter: string, index: number) => {
    e.dataTransfer.setData('letter', letter);
    e.dataTransfer.setData('index', index.toString());
  };
  
  // Handle dropping a letter into a slot
  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData('letter');
    const sourceIndex = parseInt(e.dataTransfer.getData('index'));
    
    // Only allow drop if the slot is empty
    if (!userArrangement[slotIndex]) {
      const newArrangement = [...userArrangement];
      newArrangement[slotIndex] = letter;
      setUserArrangement(newArrangement);
      
      // Mark the source letter as placed
      setPlacedIndices([...placedIndices, sourceIndex]);
      
      // Check if the word is complete
      const newArrangementWithoutEmptySlots = newArrangement.filter(l => l !== '');
      if (newArrangementWithoutEmptySlots.length === currentWord.length) {
        const arranged = newArrangement.join('');
        // Check if correct
        if (arranged === currentWord) {
          setIsCorrect(true);
          setShowSuccess(true);
          
          // Call onComplete callback if provided
          if (onComplete) {
            onComplete(currentWord, attempts + 1);
          }
          
          // Move to the next word after a delay if in demo mode or if there are more words
          if (isDemo || currentWordIndex < words.length - 1) {
            setTimeout(() => {
              const nextIndex = isDemo 
                ? (currentWordIndex + 1) % words.length 
                : currentWordIndex + 1;
              
              if (nextIndex < words.length) {
                setCurrentWordIndex(nextIndex);
                setCurrentWord(words[nextIndex]);
              }
            }, 2000);
          }
        } else {
          // Wrong arrangement - increment attempts and reset
          setAttempts(attempts + 1);
          
          // Shake effect for wrong answer
          const slots = document.querySelectorAll('.letter-slot');
          slots.forEach(slot => {
            slot.classList.add('animate-shake');
            setTimeout(() => {
              slot.classList.remove('animate-shake');
            }, 500);
          });
          
          // Reset the arrangement after a short delay
          setTimeout(() => {
            setUserArrangement(Array(currentWord.length).fill(''));
            setPlacedIndices([]);
          }, 800);
        }
      }
    }
  };
  
  // Allow dropping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Reset a letter placement
  const handleSlotClick = (slotIndex: number) => {
    if (userArrangement[slotIndex]) {
      // Find which original letter this was
      const letterToReset = userArrangement[slotIndex];
      const originalIndex = scrambledLetters.findIndex(
        (l, i) => l === letterToReset && placedIndices.includes(i)
      );
      
      // Remove from placed indices
      setPlacedIndices(placedIndices.filter(i => i !== originalIndex));
      
      // Clear the slot
      const newArrangement = [...userArrangement];
      newArrangement[slotIndex] = '';
      setUserArrangement(newArrangement);
    }
  };
  
  // Show hint if available
  const showHint = () => {
    if (hints[currentWordIndex]) {
      // In a real implementation, this would show a hint or play audio
      console.log(`Hint: ${hints[currentWordIndex]}`);
    }
  };
  
  // Check if we have any words to display
  if (!currentWord) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No words available. Please add some words to play!
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
      {isDemo ? (
        <h3 className="text-xl font-[family-name:var(--font-bubblegum-sans)] mb-4 text-blue-600 dark:text-blue-400">
          Try the Demo!
        </h3>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-[family-name:var(--font-bubblegum-sans)] text-blue-600 dark:text-blue-400">
            Word {currentWordIndex + 1} of {words.length}
          </h3>
          {hints[currentWordIndex] && (
            <button 
              onClick={showHint}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2"
              aria-label="Show hint"
            >
              💡
            </button>
          )}
        </div>
      )}
      
      {/* Drop area for letter arrangement */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: currentWord.length }).map((_, index) => (
          <div
            key={`slot-${index}`}
            className={`letter-slot w-12 h-12 border-2 ${
              userArrangement[index] 
                ? 'border-green-500 bg-green-100 dark:bg-green-900' 
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md flex items-center justify-center text-2xl font-bold cursor-pointer`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleSlotClick(index)}
          >
            {userArrangement[index]}
          </div>
        ))}
      </div>
      
      {/* Scrambled letters */}
      <div className="flex justify-center gap-2">
        {scrambledLetters.map((letter, index) => (
          <div
            key={`letter-${index}`}
            className={`w-12 h-12 ${
              placedIndices.includes(index) 
                ? 'opacity-0 cursor-default' 
                : 'bg-blue-500 dark:bg-blue-600 cursor-grab'
            } rounded-md flex items-center justify-center text-2xl font-bold text-white`}
            draggable={!placedIndices.includes(index)}
            onDragStart={(e) => handleDragStart(e, letter, index)}
          >
            {placedIndices.includes(index) ? '' : letter}
          </div>
        ))}
      </div>
      
      {/* Success message */}
      {showSuccess && (
        <div className="mt-4 text-green-600 dark:text-green-400 font-bold animate-bounce">
          Great job! 🎉
        </div>
      )}
      
      {/* Attempts counter - only show in full game mode */}
      {!isDemo && (
        <div className="mt-4 text-gray-600 dark:text-gray-400">
          Attempts: {attempts}
        </div>
      )}
    </div>
  );
};

export { WordleGame };
