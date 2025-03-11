'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../../components/button';
import type { WordResult } from '.';

interface ResultsScreenProps {
  words: string[];
  wordResults: WordResult[];
  onReset: () => void;
}

export function ResultsScreen({ words, wordResults, onReset }: ResultsScreenProps) {
  const router = useRouter();
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
      
      <div className="mt-6 flex gap-4 justify-center">
        <Button
          onClick={onReset}
          color="green"
          className="text-white px-6 py-2"
        >
          Play Again
        </Button>
        
        <Button
          onClick={() => router.push('/progress')}
          color="amber"
          className="text-white px-6 py-2"
        >
          See Progress
        </Button>
      </div>
    </div>
  );
}

// Calculate grade based on performance
function calculateGrade(results: WordResult[]): { grade: string, percentage: number } {
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
}
