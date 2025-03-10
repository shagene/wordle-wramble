"use client";

type StatsSummaryProps = {
  totalStars: number;
  totalWordsCompleted: number;
  totalWordsAttempted: number;
  perfectWords: number;
};

export function StatsSummary({ 
  totalStars, 
  totalWordsCompleted, 
  totalWordsAttempted, 
  perfectWords 
}: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 p-4 rounded-lg shadow-md">
        <h3 className="text-amber-800 dark:text-amber-200 text-lg font-bold">Total Stars</h3>
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-300 flex items-center">
          {totalStars} <span className="ml-2 text-2xl">⭐</span>
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg shadow-md">
        <h3 className="text-green-800 dark:text-green-200 text-lg font-bold">Words Completed</h3>
        <p className="text-3xl font-bold text-green-600 dark:text-green-300">
          {totalWordsCompleted}
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg shadow-md">
        <h3 className="text-blue-800 dark:text-blue-200 text-lg font-bold">Words Attempted</h3>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
          {totalWordsAttempted}
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg shadow-md">
        <h3 className="text-purple-800 dark:text-purple-200 text-lg font-bold">Perfect Words</h3>
        <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 flex items-center">
          {perfectWords} <span className="ml-2 text-2xl">🎯</span>
        </p>
      </div>
    </div>
  );
}
