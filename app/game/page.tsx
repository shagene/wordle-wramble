'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from "../components/heading";
import { WordleGame } from "../ui";
import { Button } from "../components/button";
import Link from 'next/link';

// Define types for our word list structure
type WordList = {
  id: string;
  name: string;
  words: string[];
  hints?: string[];
  dateCreated: string;
};

// Placeholder word lists (in a real app, these would come from localStorage)
const PLACEHOLDER_WORD_LISTS: WordList[] = [
  {
    id: 'list1',
    name: 'Week 1 Spelling',
    words: ['SPELL', 'LEARN', 'SCHOOL'],
    hints: ['Write out letters in order', 'To gain knowledge', 'Where children study'],
    dateCreated: '2025-03-01',
  },
  {
    id: 'list2',
    name: 'Animals',
    words: ['TIGER', 'ZEBRA', 'GIRAFFE'],
    hints: ['Striped cat', 'Black and white stripes', 'Long neck'],
    dateCreated: '2025-03-05',
  },
  {
    id: 'list3',
    name: 'Colors',
    words: ['PURPLE', 'ORANGE', 'YELLOW'],
    hints: ['Mix of red and blue', 'Mix of red and yellow', 'Color of the sun'],
    dateCreated: '2025-03-08',
  },
];

export default function GamePage() {
  const router = useRouter();
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [selectedList, setSelectedList] = useState<WordList | null>(null);
  const [loading, setLoading] = useState(true);

  // Load word lists from localStorage
  useEffect(() => {
    const loadWordLists = () => {
      try {
        setLoading(true);
        
        // Check if we're in the browser environment before accessing localStorage
        if (typeof window !== 'undefined') {
          // Load saved lists from localStorage
          const savedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
          
          setWordLists(savedLists);
          
          // If no lists exist, redirect to add words page
          if (savedLists.length === 0) {
            router.push('/wordlist/create');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading word lists:', error);
        setWordLists([]);
        setLoading(false);
      }
    };
    
    loadWordLists();
  }, [router]);

  // Handle selecting a word list
  const handleSelectList = (list: WordList) => {
    setSelectedList(list);
  };

  // If a list is selected, show the game with that list's words
  if (selectedList) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-blue-600 dark:text-blue-400">
          {selectedList.name}
        </Heading>
        
        <div className="w-full max-w-2xl mx-auto mb-8">
          <WordleGame 
            words={selectedList.words} 
            hints={selectedList.hints} 
            isDemo={false}
            onComplete={(word, attempts) => {
              console.log(`Completed word: ${word} in ${attempts} attempts`);
              // Save progress to localStorage
              try {
                if (typeof window !== 'undefined') {
                  // Get existing progress or initialize empty object
                  const progress = JSON.parse(localStorage.getItem('wordleProgress') || '{}');
                  
                  // Update progress for this list and word
                  if (!progress[selectedList.id]) {
                    progress[selectedList.id] = {};
                  }
                  
                  progress[selectedList.id][word] = {
                    completed: true,
                    attempts,
                    timestamp: new Date().toISOString()
                  };
                  
                  // Save back to localStorage
                  localStorage.setItem('wordleProgress', JSON.stringify(progress));
                }
              } catch (error) {
                console.error('Error saving progress:', error);
              }
            }}
          />
        </div>
        
        <Button 
          outline
          onClick={() => setSelectedList(null)}
          className="mt-6 text-blue-600 hover:text-blue-700"
        >
          Back to Wordles
        </Button>
      </div>
    );
  }

  // Otherwise, show the list selection screen
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Navigation header */}
      <div className="w-full max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back to Home</span>
        </Link>
        
        <Link href="/wordlist/create" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span>New Wordle</span>
        </Link>
      </div>
      
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-blue-600 dark:text-blue-400">
        Choose a Wordle
      </Heading>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p>Loading word lists...</p>
        </div>
      ) : wordLists.length === 0 ? (
        <div className="text-center py-8 max-w-md mx-auto">
          <p className="text-lg mb-6">You don't have any word lists yet!</p>
          <Link href="/wordlist/create">
            <Button color="green" className="text-white">
              Create Your First List
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto p-4">
          {wordLists.map((list) => (
            <div 
              key={list.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-blue-400 transition-all cursor-pointer animate-in fade-in"
              onClick={() => handleSelectList(list)}
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
          ))}
          
          <Link href="/wordlist/create" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-dashed border-green-400 hover:border-green-500 transition-all cursor-pointer h-full flex flex-col items-center justify-center animate-in fade-in">
              <div className="text-4xl text-green-500 mb-4">+</div>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">Create New Wordle</h3>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
