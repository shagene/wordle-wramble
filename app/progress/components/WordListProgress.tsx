"use client";

import { WordList, ListProgress } from "../types";
import { Button } from "../../components/button";
import Link from "next/link";

type WordListProgressProps = {
  wordList: WordList;
  listProgress: ListProgress;
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

export function WordListProgress({ wordList, listProgress }: WordListProgressProps) {
  const completedWords = wordList.words.filter(word => 
    listProgress[word] && listProgress[word].completed
  ).length;
  
  const totalWords = wordList.words.length;
  const progressPercent = totalWords > 0 
    ? Math.round((completedWords / totalWords) * 100) 
    : 0;

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{wordList.name}</h3>
        <Link href={`/game?listId=${wordList.id}`}>
          <Button data-color="blue" className="text-sm py-1 px-3">
            Practice
          </Button>
        </Link>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Progress: {completedWords}/{totalWords} words</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-3 mt-4">
        {wordList.words.map((word, index) => {
          const wordData = listProgress[word];
          const completed = wordData && wordData.completed;
          const attempts = wordData ? wordData.attempts : 0;
          const stars = wordData ? (wordData.stars || getStarsForAttempts(attempts)) : 0;
          
          return (
            <div 
              key={`${wordList.id}-${word}-${index}`}
              className={`p-3 rounded-md ${
                completed 
                  ? 'bg-green-50 dark:bg-green-900/30' 
                  : 'bg-gray-50 dark:bg-gray-700/30'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${completed ? 'text-green-700 dark:text-green-300' : ''}`}>
                    {word}
                  </span>
                  {wordList.hints && wordList.hints[index] && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({wordList.hints[index]})
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {completed ? (
                    <>
                      <span className="text-sm font-medium">
                        Grade: {getGradeForAttempts(attempts)}
                      </span>
                      <span className="text-sm font-medium">
                        {renderStars(stars)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Not completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
