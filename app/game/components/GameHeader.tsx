'use client';

import Link from 'next/link';
import { Heading } from '../../components/heading';

type GameHeaderProps = {
  title: string;
  backUrl?: string;
  backText?: string;
  showNewWordleButton?: boolean;
};

export function GameHeader({ 
  title, 
  backUrl = '/', 
  backText = 'Back to Home',
  showNewWordleButton = false 
}: GameHeaderProps) {
  return (
    <>
      <div className="w-full max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <Link href={backUrl} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>{backText}</span>
        </Link>
        
        {showNewWordleButton && (
          <Link href="/wordlist/create" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>New Wordle</span>
          </Link>
        )}
      </div>
      
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-blue-600 dark:text-blue-400">
        {title}
      </Heading>
    </>
  );
}
