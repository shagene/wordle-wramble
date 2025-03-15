'use client';

import { useState } from 'react';
import { LetterTile } from '../index';
import type { LetterStatus } from '.';

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
    </>
  );
}
