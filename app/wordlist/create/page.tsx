"use client";

import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { useState } from "react";
import Link from "next/link";

export default function CreateWordListPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-green-600 dark:text-green-400">
        Add Your Spelling Words
      </Heading>
      <p className="text-xl text-center max-w-2xl mb-8 font-[family-name:var(--font-bubblegum-sans)]">
        Add your spelling words and hints here to practice them in the game!
      </p>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
        <p className="text-center mb-4 text-slate-500 dark:text-slate-400">
          This page will have a form for adding spelling words and optional hints.
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