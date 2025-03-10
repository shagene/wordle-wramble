"use client";

import { useEffect, useState } from "react";
import { Heading } from "../components/heading";
import { Button } from "../components/button";
import Link from "next/link";

// Define achievement types
type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  color: string;
  unlocked: boolean;
};

// Define types for our progress tracking
type WordProgress = {
  completed: boolean;
  attempts: number;
  timestamp: string;
};

type ListProgress = {
  [wordId: string]: WordProgress;
};

type AllProgress = {
  [listId: string]: ListProgress;
};

// Type for word list structure
type WordList = {
  id: string;
  name: string;
  words: string[];
  hints?: string[];
  dateCreated: string;
};

// Function to determine grade based on attempts
const getGradeForAttempts = (attempts: number): string => {
  if (attempts === 1) return "A+";
  if (attempts === 2) return "A";
  if (attempts === 3) return "B";
  return "C";
};

// Function to get star count based on attempts
const getStarsForAttempts = (attempts: number): number => {
  if (attempts === 1) return 3; // Gold star
  if (attempts === 2) return 2; // Silver star
  if (attempts === 3) return 1; // Bronze star
  return 0; // No star
};

// Function to render stars based on count
const renderStars = (count: number): React.ReactNode => {
  const goldStar = "⭐";
  const silverStar = "🌟";
  const bronzeStar = "✨";
  
  if (count === 3) return <span className="text-2xl">{goldStar}{goldStar}{goldStar}</span>;
  if (count === 2) return <span className="text-2xl">{goldStar}{goldStar}</span>;
  if (count === 1) return <span className="text-2xl">{goldStar}</span>;
  return <span className="text-gray-400">No stars yet</span>;
};

export default function ProgressPage() {
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [progress, setProgress] = useState<AllProgress>({});
  const [loading, setLoading] = useState(true);
  const [totalStars, setTotalStars] = useState(0);
  const [totalWordsCompleted, setTotalWordsCompleted] = useState(0);
  const [totalWordsAttempted, setTotalWordsAttempted] = useState(0);
  const [perfectWords, setPerfectWords] = useState(0);
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
          
          setTotalStars(stars);
          setTotalWordsCompleted(completed);
          setTotalWordsAttempted(attempted);
          setPerfectWords(perfectWords);
          
          // Update achievements based on stats
          const updatedAchievements = achievements.map(achievement => {
            let unlocked = false;
            
            // Check thresholds for different achievement types
            if (achievement.id === 'perfect_speller') {
              unlocked = perfectWords >= achievement.threshold;
            } else if (achievement.id === 'wordle_wizard') {
              unlocked = completed >= achievement.threshold;
            } else {
              // Star-based achievements
              unlocked = stars >= achievement.threshold;
            }
            
            return { ...achievement, unlocked };
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
  
  // Render a list card with progress
  const renderListCard = (list: WordList) => {
    const listProgress = progress[list.id] || {};
    const completedWords = list.words.filter(word => 
      listProgress[word]?.completed
    );
    
    const listStars = list.words.reduce((total, word) => {
      if (listProgress[word]?.completed) {
        return total + getStarsForAttempts(listProgress[word].attempts);
      }
      return total;
    }, 0);
    
    const progressPercent = list.words.length > 0 
      ? Math.round((completedWords.length / list.words.length) * 100) 
      : 0;
    
    return (
      <div key={list.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">{list.name}</h3>
          <div className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm font-medium">
            {completedWords.length}/{list.words.length} words
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-amber-500 h-2.5 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-center">
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total Stars: </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{listStars}</span>
          </div>
        </div>
        
        {completedWords.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Completed Words:</h4>
            <div className="grid grid-cols-2 gap-2">
              {list.words.map(word => {
                const wordData = listProgress[word];
                if (!wordData?.completed) return null;
                
                return (
                  <div key={word} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="font-medium">{word}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Grade: {getGradeForAttempts(wordData.attempts)}
                      </span>
                      <span>
                        {renderStars(getStarsForAttempts(wordData.attempts))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <Link href={`/game?list=${list.id}`} className="inline-block w-full">
            <Button color="amber" className="w-full">
              Practice This Wordle
            </Button>
          </Link>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-amber-600 dark:text-amber-400">
        Your Star Progress
      </Heading>
      
      <p className="text-xl text-center max-w-2xl mb-8 font-[family-name:var(--font-bubblegum-sans)]">
        Here you can see how well you're doing with your spelling words!
      </p>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-amber-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Loading your progress...</p>
        </div>
      ) : (
        <>
          {/* Overall Stats Card */}
          <div className="w-full max-w-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-center text-amber-700 dark:text-amber-300 mb-4 font-[family-name:var(--font-bubblegum-sans)]">Overall Progress</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{totalStars}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Stars</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{totalWordsCompleted}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Words Mastered</div>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {totalWordsAttempted > 0 ? Math.round((totalWordsCompleted / totalWordsAttempted) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
              </div>
            </div>
            
            {/* Achievements Section */}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-center text-amber-700 dark:text-amber-300 mb-4 font-[family-name:var(--font-bubblegum-sans)]">Achievements</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`p-3 rounded-lg transition-all ${achievement.unlocked 
                      ? achievement.color + " animate-in fade-in-50 duration-500" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-bold">{achievement.title}</h4>
                        <p className="text-xs">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${achievement.id === 'perfect_speller' || achievement.id === 'wordle_wrambler' ? 'bg-amber-800 text-white dark:bg-amber-300 dark:text-amber-900' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                          Unlocked!
                        </span>
                      )}
                    </div>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-amber-300 dark:bg-amber-600 h-1.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, achievement.id === 'perfect_speller' 
                                ? (perfectWords / achievement.threshold) * 100
                                : achievement.id === 'wordle_wizard'
                                ? (totalWordsCompleted / achievement.threshold) * 100
                                : (totalStars / achievement.threshold) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Word Lists Progress */}
          <div className="w-full max-w-2xl">
            {wordLists.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-lg mb-6">You don't have any Wordles yet!</p>
                <Link href="/wordlist/create">
                  <Button color="green" className="text-white">
                    Create Your First Wordle
                  </Button>
                </Link>
              </div>
            ) : (
              wordLists.map(list => renderListCard(list))
            )}
          </div>
        </>
      )}
      
      <div className="flex gap-4 mt-8">
        <Button color="blue" href="/" className="font-[family-name:var(--font-bubblegum-sans)]">
          Back to Home
        </Button>
        
        <Button color="green" href="/game" className="font-[family-name:var(--font-bubblegum-sans)]">
          Play Wordles
        </Button>
      </div>
    </div>
  );
}
