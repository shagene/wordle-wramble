"use client";

type OverallStatsCardProps = {
  totalStars: number;
  totalWordsCompleted: number;
  totalWordsAttempted: number;
};

export function OverallStatsCard({ 
  totalStars, 
  totalWordsCompleted, 
  totalWordsAttempted 
}: OverallStatsCardProps) {
  const completionRate = totalWordsAttempted > 0 
    ? Math.round((totalWordsCompleted / totalWordsAttempted) * 100) 
    : 0;

  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-center text-amber-700 dark:text-amber-300 mb-4 font-[family-name:var(--font-bubblegum-sans)]">
        Overall Progress
      </h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {totalStars}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Stars
          </div>
        </div>
        
        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {totalWordsCompleted}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Words Mastered
          </div>
        </div>
        
        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {completionRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Completion Rate
          </div>
        </div>
      </div>
    </div>
  );
}
