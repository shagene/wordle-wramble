'use client';

import { LetterTile } from '../index';
import type { LetterStatus } from '.';
import { useState } from 'react';

interface DragAndDropProps {
  currentWord: string;
  scrambledLetters: string[];
  userArrangement: string[];
  placedIndices: number[];
  letterStatuses: LetterStatus[];
  onArrangementChange: (newArrangement: string[], newPlacedIndices: number[]) => void;
  onComplete: (isCorrect: boolean) => void;
  onSlotClick: (slotIndex: number) => void;
}

export function DragAndDrop({
  currentWord,
  scrambledLetters,
  userArrangement,
  placedIndices,
  letterStatuses,
  onArrangementChange,
  onComplete,
  onSlotClick
}: DragAndDropProps) {
  // State for touch interactions
  const [activeLetter, setActiveLetter] = useState<{ letter: string; index: number; sourceType: string } | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  // Handle dragging a letter
  const handleDragStart = (e: React.DragEvent, letter: string, index: number): void => {
    e.dataTransfer.setData('letter', letter);
    e.dataTransfer.setData('index', index.toString());
    e.dataTransfer.setData('sourceType', placedIndices.includes(index) ? 'slot' : 'source');
  };
  
  // Handle dropping a letter into a slot
  const handleDrop = (e: React.DragEvent, slotIndex: number): void => {
    e.preventDefault();
    const letter = e.dataTransfer.getData('letter');
    const sourceIndex = parseInt(e.dataTransfer.getData('index'));
    const sourceType = e.dataTransfer.getData('sourceType');
    
    handleLetterPlacement(letter, sourceIndex, sourceType, slotIndex);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent, letter: string, index: number): void => {
    e.preventDefault();
    setActiveLetter({
      letter,
      index,
      sourceType: placedIndices.includes(index) ? 'slot' : 'source'
    });
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent): void => {
    if (!activeLetter) return;
    e.preventDefault();
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent, slotIndex: number): void => {
    if (!activeLetter) return;
    e.preventDefault();
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Calculate the distance moved
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // If the touch moved significantly, consider it a drag
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      handleLetterPlacement(activeLetter.letter, activeLetter.index, activeLetter.sourceType, slotIndex);
    }
    
    setActiveLetter(null);
  };

  // Common function to handle letter placement
  const handleLetterPlacement = (letter: string, sourceIndex: number, sourceType: string, slotIndex: number): void => {
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
    
    onArrangementChange(newArrangement, newPlacedIndices);
    
    // Check if the word is complete
    const isComplete = newArrangement.every(letter => letter !== '');
    if (isComplete) {
      const arranged = newArrangement.join('');
      onComplete(arranged === currentWord);
    }
  };
  
  // Allow dropping
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
  };

  return (
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
            onClick={() => onSlotClick(index)}
            draggable={!!userArrangement[index]}
            isSlot
            onTouchStart={(e) => handleTouchStart(e, userArrangement[index] || '', index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => handleTouchEnd(e, index)}
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
            onTouchStart={(e) => handleTouchStart(e, letter, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => handleTouchEnd(e, index)}
          />
        ))}
      </div>
    </>
  );
}
