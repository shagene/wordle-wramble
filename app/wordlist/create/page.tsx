"use client";

import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from "next/link";

// Define our schema with Zod
const wordListSchema = z.object({
  name: z.string().min(1, "List name is required"),
  words: z.array(
    z.object({
      word: z.string().min(1, "Word is required").toUpperCase(),
      hint: z.string().optional(),
    })
  ).min(1, "At least one word is required"),
});

type WordListFormValues = z.infer<typeof wordListSchema>;

export default function CreateWordListPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Initialize form with react-hook-form
  const { register, control, handleSubmit, formState: { errors } } = useForm<WordListFormValues>({
    resolver: zodResolver(wordListSchema),
    defaultValues: {
      name: '',
      words: [{ word: '', hint: '' }],
    },
  });
  
  // Use field array for dynamic words/hints
  const { fields, append, remove } = useFieldArray({
    control,
    name: "words",
  });

  // Handle form submission
  const onSubmit: SubmitHandler<WordListFormValues> = (data) => {
    setIsSaving(true);
    
    try {
      console.log('Saving word list:', data);
      
      // Actual localStorage implementation
      setTimeout(() => {
        // Get existing word lists or initialize an empty array
        const existingLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
        
        // Create new word list object
        const newList = {
          id: Date.now().toString(),
          name: data.name,
          words: data.words.map(w => w.word),
          hints: data.words.map(w => w.hint || ''),
          dateCreated: new Date().toISOString()
        };
        
        // Save updated lists back to localStorage
        localStorage.setItem('wordLists', JSON.stringify([...existingLists, newList]));
        
        setIsSaving(false);
        setSaveSuccess(true);
        
        // Redirect to game page after successful save
        setTimeout(() => {
          router.push('/game');
        }, 1500);
      }, 1000); // Keeping the timeout for UX, but we could remove it in production
    } catch (error) {
      console.error('Error saving word list:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-4xl mb-6 text-green-600 dark:text-green-400">
        Create Your Wordle
      </Heading>
      <p className="text-xl text-center max-w-2xl mb-8 font-[family-name:var(--font-bubblegum-sans)]">
        Add your spelling words and hints here to practice them in the game!
      </p>
      
      {saveSuccess ? (
        <div className="w-full max-w-xl bg-green-100 dark:bg-green-900 rounded-xl shadow-lg p-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">Wordle Saved!</h3>
            <p className="text-green-600 dark:text-green-400 mb-4">Redirecting to the game page...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wordle Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Week 1 Spelling Words"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Words & Hints</h3>
              <Button
                type="button"
                outline
                className="text-green-600 hover:text-green-700 text-sm"
                onClick={() => append({ word: '', hint: '' })}
              >
                + Add Word
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg relative animate-in fade-in">
                <div className="flex-1">
                  <label htmlFor={`words.${index}.word`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Word
                  </label>
                  <input
                    id={`words.${index}.word`}
                    type="text"
                    placeholder="e.g., SPELL"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    {...register(`words.${index}.word` as const)}
                  />
                  {errors.words?.[index]?.word && (
                    <p className="mt-1 text-sm text-red-500">{errors.words[index]?.word?.message}</p>
                  )}
                </div>
                
                <div className="flex-1">
                  <label htmlFor={`words.${index}.hint`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hint (Optional)
                  </label>
                  <input
                    id={`words.${index}.hint`}
                    type="text"
                    placeholder="e.g., To write out letters"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    {...register(`words.${index}.hint` as const)}
                  />
                </div>
                
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    aria-label="Remove word"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            {errors.words && !Array.isArray(errors.words) && (
              <p className="mt-1 text-sm text-red-500">{errors.words.message}</p>
            )}
          </div>
          
          <div className="flex gap-4 justify-center mt-8">
            <Link href="/game">
              <Button outline className="text-blue-600 hover:text-blue-700">
                Cancel
              </Button>
            </Link>
            
            <Button 
              type="submit" 
              color="green"
              className="text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⌛</span>
                  Saving...
                </>
              ) : "Save Word List"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}