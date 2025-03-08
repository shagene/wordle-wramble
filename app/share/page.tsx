"use client";

import { Heading } from "../components/heading";
import { Button } from "../components/button";
import Link from "next/link";

export default function SharePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-purple-600 dark:text-purple-400">
        Share Your Word Lists
      </Heading>
      <p className="text-xl text-center max-w-2xl mb-8 font-[family-name:var(--font-bubblegum-sans)]">
        Create a special link to share your word lists with friends and family!
      </p>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
        <p className="text-center mb-4 text-slate-500 dark:text-slate-400">
          This page will generate sharable links for your word lists and allow you to copy them easily.
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
