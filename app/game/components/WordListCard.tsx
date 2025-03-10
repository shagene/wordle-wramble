'use client';

import { WordList } from '../types';

type WordListCardProps = {
  list: WordList;
  onClick: (list: WordList) => void;
};

export function WordListCard({ list, onClick }: WordListCardProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-blue-400 transition-all cursor-pointer animate-in fade-in"
      onClick={() => onClick(list)}
    >
      <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">{list.name}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-2">{list.words.length} words</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Created: {new Date(list.dateCreated).toLocaleDateString()}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {list.words.slice(0, 3).map((word, index) => (
          <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
            {word}
          </span>
        ))}
        {list.words.length > 3 && (
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm">
            +{list.words.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}
