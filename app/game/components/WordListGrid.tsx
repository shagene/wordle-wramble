'use client';

import Link from 'next/link';
import { WordList } from '../types';
import { WordListCard } from './WordListCard';

type WordListGridProps = {
  wordLists: WordList[];
  onSelectList: (list: WordList) => void;
};

export function WordListGrid({ wordLists, onSelectList }: WordListGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto p-4">
      {wordLists.map((list) => (
        <WordListCard 
          key={list.id} 
          list={list} 
          onClick={onSelectList}
        />
      ))}
      
      <Link href="/wordlist/create" className="block">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-dashed border-green-400 hover:border-green-500 transition-all cursor-pointer h-full flex flex-col items-center justify-center animate-in fade-in">
          <div className="text-4xl text-green-500 mb-4">+</div>
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400">Create New Wordle</h3>
        </div>
      </Link>
    </div>
  );
}
