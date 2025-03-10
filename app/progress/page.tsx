"use client";

import { Heading } from "../components/heading";
import { Button } from "../components/button";
import Link from "next/link";
import {
  ProgressDataLoader,
  StatsSummary,
  OverallStatsCard,
  AchievementsSection,
  WordListProgress
} from "./components";

export default function ProgressPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-amber-600 dark:text-amber-400">
        Your Star Progress
      </Heading>
      
      <p className="text-xl text-center max-w-2xl mb-8 font-[family-name:var(--font-bubblegum-sans)]">
        Here you can see how well you're doing with your spelling words!
      </p>
      
      <ProgressDataLoader>
        {({ wordLists, progress, stats, achievements, loading }) => (
          loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-10 w-10 border-4 border-amber-500 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p>Loading your progress...</p>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <StatsSummary 
                totalStars={stats.totalStars}
                totalWordsCompleted={stats.totalWordsCompleted}
                totalWordsAttempted={stats.totalWordsAttempted}
                perfectWords={stats.perfectWords}
              />
              
              {/* Overall Stats Card with Achievements */}
              <div className="w-full max-w-2xl">
                <OverallStatsCard 
                  totalStars={stats.totalStars}
                  totalWordsCompleted={stats.totalWordsCompleted}
                  totalWordsAttempted={stats.totalWordsAttempted}
                />
                
                <AchievementsSection achievements={achievements} />
              </div>
              
              {/* Word Lists Progress */}
              <div className="w-full max-w-2xl">
                {wordLists.length === 0 ? (
                  <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <p className="text-lg mb-6">You don't have any Wordles yet!</p>
                    <Link href="/wordlist/create">
                      <Button data-color="green" className="text-white">
                        Create Your First Wordle
                      </Button>
                    </Link>
                  </div>
                ) : (
                  wordLists.map(list => (
                    <WordListProgress 
                      key={list.id}
                      wordList={list}
                      listProgress={progress[list.id] || {}}
                    />
                  ))
                )}
              </div>
            </>
          )
        )}
      </ProgressDataLoader>
      
      <div className="flex gap-4 mt-8">
        <Link href="/">
          <Button data-color="blue" className="font-[family-name:var(--font-bubblegum-sans)]">
            Back to Home
          </Button>
        </Link>
        
        <Link href="/game">
          <Button data-color="green" className="font-[family-name:var(--font-bubblegum-sans)]">
            Play Wordles
          </Button>
        </Link>
      </div>
    </div>
  );
}
