'use client';

import { useEffect, useState } from 'react';
import { WordList, WordProgress } from '../types';
import { useGameContext } from '../context/GameContext';

type GameProgressProps = {
  wordList: WordList;
};

export function GameProgress({ wordList }: GameProgressProps) {
  const { currentWordIndex } = useGameContext();
  const [progress, setProgress] = useState<{[word: string]: WordProgress}>({});
  
  useEffect(() => {
    // Load progress from localStorage
    try {
      if (typeof window !== 'undefined') {
        const savedProgress = JSON.parse(localStorage.getItem('wordleProgress') || '{}');
        const listProgress = savedProgress[wordList.id] || {};
        setProgress(listProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, [wordList.id]);
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 dark:text-gray-300">Progress:</span>
        <span className="text-blue-600 dark:text-blue-400 font-bold">
          {currentWordIndex + 1} / {wordList.words.length}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${((currentWordIndex + 1) / wordList.words.length) * 100}%` }}
        ></div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {wordList.words.map((word, index) => {
          const isCompleted = progress[word]?.completed;
          const isCurrent = index === currentWordIndex;
          
          return (
            <div 
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {index + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
