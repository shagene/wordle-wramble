"use client";

import { Heading } from "../components/heading";
import { Button } from "../components/button";
import Link from "next/link";

export default function ProgressPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-amber-600 dark:text-amber-400">
        Your Star Progress
      </Heading>
      <p className="text-xl text-center max-w-2xl mb-8 font-[family-name:var(--font-bubblegum-sans)]">
        Here you can see how well you're doing with your spelling words!
      </p>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
        <p className="text-center mb-4 text-slate-500 dark:text-slate-400">
          This page will show your progress with gold stars for mastered words and silver stars for words in progress.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button color="blue" href="/" className="font-[family-name:var(--font-bubblegum-sans)]">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
