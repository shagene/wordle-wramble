'use client';

import { Header, NavButton } from "@/app/ui";
import { WordleGame } from "@/app/ui";
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth';
import { Heading } from '@/app/components/heading';
import { Button } from '@/app/components/button';
import Link from 'next/link';
import { GameProvider } from '@/app/game/context/GameContext';

export default function HomePage() {
  const { user, isLoading } = useSupabaseAuth();
  
  return (
    <div className="flex flex-col items-center">
      <Header />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <NavButton 
          href="/game"
          icon="🎮"
          color="blue"
          ariaLabel="Play Wordles"
        >
          Play Wordles
        </NavButton>
        
        <NavButton 
          href="/wordlist/create"
          icon="✏️"
          color="green"
          ariaLabel="Create Wordle"
        >
          Create Wordle
        </NavButton>
        
        <NavButton 
          href="/progress"
          icon="⭐"
          color="amber"
          ariaLabel="See your star progress"
        >
          See Progress
        </NavButton>
        
        <NavButton 
          href="/share"
          icon="📤"
          color="purple"
          ariaLabel="Share Wordles"
        >
          Share Wordles
        </NavButton>
      </div>
      
      {!user && !isLoading && (
        <div className="mt-10 w-full max-w-md bg-white/70 backdrop-blur-sm rounded-lg shadow-md p-6 dark:bg-gray-800/70">
          <h2 className="text-xl font-semibold mb-4 text-center">Try a Demo Wordle</h2>
          <GameProvider>
            <WordleGame isDemo={true} />
          </GameProvider>
          
          <div className="mt-6 text-center">
            <Link href="/auth/login">
              <Button color="blue">
                Sign in to create your own
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Debug Section */}
      <div className="w-full max-w-3xl border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
        <Heading level={3} className="text-lg mb-4 text-gray-600 dark:text-gray-400">
          Debug Tools
        </Heading>
        
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <Link href="/test">
            <Button outline className="w-full">
              Supabase Test
            </Button>
          </Link>
          
          <Link href="/debug">
            <Button outline className="w-full">
              Environment Debug
            </Button>
          </Link>
          
          <Link href="/debug/supabase">
            <Button outline className="w-full">
              Supabase Debug
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
