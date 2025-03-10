"use client";

import { useEffect, useState } from "react";
import { Achievement, WordList, AllProgress } from "../types";

// Function to get star count based on attempts
const getStarsForAttempts = (attempts: number): number => {
  if (attempts === 1) return 3; // Gold star
  if (attempts === 2) return 2; // Silver star
  if (attempts === 3) return 1; // Bronze star
  return 0; // No star
};

type ProgressStats = {
  totalStars: number;
  totalWordsCompleted: number;
  totalWordsAttempted: number;
  perfectWords: number;
};

type ProgressDataLoaderProps = {
  children: (data: {
    wordLists: WordList[];
    progress: AllProgress;
    stats: ProgressStats;
    achievements: Achievement[];
    loading: boolean;
  }) => React.ReactNode;
};

export function ProgressDataLoader({ children }: ProgressDataLoaderProps) {
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [progress, setProgress] = useState<AllProgress>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProgressStats>({
    totalStars: 0,
    totalWordsCompleted: 0,
    totalWordsAttempted: 0,
    perfectWords: 0
  });
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_star',
      title: 'First Star',
      description: 'Earn your first star',
      icon: '⭐',
      threshold: 1,
      color: 'bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100',
      unlocked: false
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      description: 'Earn 10 stars',
      icon: '🌟',
      threshold: 10,
      color: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
      unlocked: false
    },
    {
      id: 'star_hoarder',
      title: 'Star Hoarder',
      description: 'Earn 25 stars',
      icon: '✨',
      threshold: 25,
      color: 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200',
      unlocked: false
    },
    {
      id: 'star_champion',
      title: 'Star Champion',
      description: 'Earn 50 stars',
      icon: '🏆',
      threshold: 50,
      color: 'bg-amber-300 dark:bg-amber-700 text-amber-800 dark:text-amber-200',
      unlocked: false
    },
    {
      id: 'star_master',
      title: 'Star Master',
      description: 'Earn 100 stars',
      icon: '👑',
      threshold: 100,
      color: 'bg-amber-400 dark:bg-amber-600 text-amber-900 dark:text-amber-100',
      unlocked: false
    },
    {
      id: 'wordle_wrambler',
      title: 'Wordle Wrambler',
      description: 'Earn 200 stars and become a true Wordle Wramble master',
      icon: '🌞',
      threshold: 200,
      color: 'bg-gradient-to-r from-amber-500 to-yellow-400 dark:from-amber-500 dark:to-yellow-400 text-white dark:text-white font-bold',
      unlocked: false
    },
    {
      id: 'perfect_speller',
      title: 'Perfect Speller',
      description: 'Complete 5 words on the first try',
      icon: '🎯',
      threshold: 5,
      color: 'bg-amber-500 dark:bg-amber-500 text-white dark:text-white',
      unlocked: false
    },
    {
      id: 'wordle_wizard',
      title: 'Wordle Wizard',
      description: 'Master 20 different words',
      icon: '🧙‍♂️',
      threshold: 20,
      color: 'bg-gradient-to-r from-amber-400 to-yellow-300 dark:from-amber-600 dark:to-yellow-500 text-amber-900 dark:text-amber-100',
      unlocked: false
    },
  ]);
  
  // Load word lists and progress from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        
        if (typeof window !== 'undefined') {
          // Load word lists
          const savedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
          setWordLists(savedLists);
          
          // Load progress data
          const savedProgress = JSON.parse(localStorage.getItem('wordleProgress') || '{}');
          setProgress(savedProgress);
          
          // Calculate statistics
          let stars = 0;
          let completed = 0;
          let attempted = 0;
          let perfectWords = 0;
          
          Object.keys(savedProgress).forEach(listId => {
            Object.keys(savedProgress[listId]).forEach(word => {
              const wordData = savedProgress[listId][word];
              if (wordData.completed) {
                completed++;
                const starCount = wordData.stars || getStarsForAttempts(wordData.attempts);
                stars += starCount;
                
                // Count perfect words (completed in first attempt)
                if (wordData.attempts === 1) {
                  perfectWords++;
                }
              }
              attempted++;
            });
          });
          
          setStats({
            totalStars: stars,
            totalWordsCompleted: completed,
            totalWordsAttempted: attempted,
            perfectWords: perfectWords
          });
          
          // Update achievements based on stats
          const updatedAchievements = achievements.map(achievement => {
            let unlocked = false;
            let progress = 0;
            
            // Check thresholds for different achievement types
            if (achievement.id === 'perfect_speller') {
              unlocked = perfectWords >= achievement.threshold;
              progress = perfectWords;
            } else if (achievement.id === 'wordle_wizard') {
              unlocked = completed >= achievement.threshold;
              progress = completed;
            } else {
              // Star-based achievements
              unlocked = stars >= achievement.threshold;
              progress = stars;
            }
            
            return { ...achievement, unlocked, progress };
          });
          
          setAchievements(updatedAchievements);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading progress data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <>
      {children({
        wordLists,
        progress,
        stats,
        achievements,
        loading
      })}
    </>
  );
}
