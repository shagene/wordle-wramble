'use client';

import { useEffect, useState } from 'react';
import { WordList, WordProgress } from '../types';
import { useGameContext } from '../context/GameContext';
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth';
import { getUserWordProgress } from '@/app/services/wordListService';

type GameProgressProps = {
  wordList: WordList;
};

export function GameProgress({ wordList }: GameProgressProps) {
  const { currentWordIndex } = useGameContext();
  const { userId } = useSupabaseAuth();
  const [, setProgress] = useState<{[word: string]: WordProgress}>({});
  
  useEffect(() => {
    // Load progress from Supabase
    const loadProgress = async () => {
      if (!userId || !wordList.id) return;
      
      try {
        const { data, error } = await getUserWordProgress(userId, wordList.id);
        
        if (error) {
          console.error('Error loading progress:', error);
          return;
        }
        
        // Format the data into the expected structure
        const formattedProgress: {[word: string]: WordProgress} = {};
        
        if (data) {
          data.forEach(item => {
            formattedProgress[item.word] = {
              completed: item.completed,
              attempts: item.attempts,
              timestamp: item.timestamp,
              stars: item.attempts === 1 ? 3 : item.attempts === 2 ? 2 : 1
            };
          });
        }
        
        setProgress(formattedProgress);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };
    
    loadProgress();
  }, [wordList.id, userId]);
  
  // Define emoji for each progress step - expanded collection for more variety
  const progressEmojis = ['🚀', '🌟', '🎮', '🎯', '🎨', '🎪', '🎭', '🎢', '🎡', '🧩', '🦄', '🐶', '🦊', '🦁', '🐱', '🦋', '🐢', '🐬', '🦉', '🦜', '🍎', '🍓', '🥝', '🍦', '🧸'];
  
  // Calculate progress percentage
  const progressPercentage = ((currentWordIndex + 1) / wordList.words.length) * 100;
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-2 border-blue-200 dark:border-blue-700 relative overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <span className="text-blue-700 dark:text-blue-300 font-[family-name:var(--font-bubblegum-sans)] text-lg">Wordle Journey:</span>
        <span className="bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full text-yellow-700 dark:text-yellow-300 font-bold">
          {currentWordIndex + 1} / {wordList.words.length}
        </span>
      </div>
      
      {/* Fun themed progress bar */}
      <div className="relative w-full h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-blue-200 dark:border-blue-700">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 ease-out flex items-center" 
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Moving emoji on the progress bar */}
          <div className="absolute right-0 transform translate-x-1/2">
            {progressEmojis[currentWordIndex % progressEmojis.length]}
          </div>
        </div>
        
        {/* Emoji markers along the progress bar */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-2 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => {
            const markerPosition = (i + 1) * (100 / 6); // Distribute markers evenly
            const isReached = progressPercentage >= markerPosition;
            // Use a different emoji for each position, but keep it consistent
            const emojiIndex = (i * 3 + 7) % progressEmojis.length; // Formula to get different emojis
            const markerEmoji = progressEmojis[emojiIndex];
            
            return (
              <span 
                key={i} 
                className={`text-xs transition-all duration-300 ${isReached ? 'text-yellow-500 scale-110' : 'text-gray-300 dark:text-gray-600'}`}
              >
                {markerEmoji}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
