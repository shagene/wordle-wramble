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
}

export function DragAndDrop({
  currentWord,
  scrambledLetters,
  userArrangement,
  placedIndices,
  letterStatuses,
  onArrangementChange,
  onComplete,
}: DragAndDropProps) {
  // State for touch interactions
  const [selectedLetter, setSelectedLetter] = useState<{ letter: string; index: number; sourceType: string } | null>(null);

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

  // Handle touch/click on a letter
  const handleLetterSelect = (letter: string, index: number, isFromSlot = false): void => {
    // If clicking on an empty slot or empty space, do nothing
    if (!letter) return;
    
    // If a letter is already selected and we click it again, deselect it
    if (selectedLetter && selectedLetter.letter === letter && selectedLetter.index === index) {
      setSelectedLetter(null);
      return;
    }
    
    setSelectedLetter({
      letter,
      index,
      sourceType: isFromSlot ? 'slot' : 'source'
    });
  };

  // Handle touch/click on a slot
  const handleSlotSelect = (slotIndex: number): void => {
    const letterInSlot = userArrangement[slotIndex];
    
    // If there's a letter in this slot and no letter is selected, select this letter
    if (letterInSlot && !selectedLetter) {
      handleLetterSelect(letterInSlot, slotIndex, true);
      return;
    }
    
    // If no letter is selected and the slot is empty, do nothing
    if (!selectedLetter) {
      return;
    }

    // Place the selected letter in the slot
    handleLetterPlacement(selectedLetter.letter, selectedLetter.index, selectedLetter.sourceType, slotIndex);
    setSelectedLetter(null);
  };

  // Common function to handle letter placement
  const handleLetterPlacement = (letter: string, sourceIndex: number, sourceType: string, slotIndex: number): void => {
    const newArrangement = [...userArrangement];
    const newPlacedIndices = [...placedIndices];
    
    // If moving to the same slot, do nothing
    if (sourceType === 'slot' && sourceIndex === slotIndex) {
      return;
    }
    
    // If the target slot has a letter, handle the replacement
    if (userArrangement[slotIndex]) {
      const targetLetter = userArrangement[slotIndex];
      if (sourceType === 'slot') {
        // Swap letters between slots
        newArrangement[sourceIndex] = targetLetter;
        newArrangement[slotIndex] = letter;
      } else {
        // Moving from source to occupied slot
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
      // Moving to an empty slot
      if (sourceType === 'slot') {
        // Moving from slot to empty slot
        newArrangement[sourceIndex] = '';
        newArrangement[slotIndex] = letter;
      } else {
        // Moving from source to empty slot
        newArrangement[slotIndex] = letter;
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
            onClick={() => handleSlotSelect(index)}
            draggable={!!userArrangement[index]}
            isSlot
            isSelected={selectedLetter?.sourceType === 'slot' && selectedLetter?.index === index}
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
            onClick={() => handleLetterSelect(letter, index)}
            isSelected={selectedLetter?.sourceType === 'source' && selectedLetter?.index === index}
          />
        ))}
      </div>
    </>
  );
}
