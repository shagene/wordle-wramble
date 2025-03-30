"use client";

import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { AlertMessage } from "@/app/ui/layout/AlertMessage";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from "next/link";
import { useSupabaseAuth } from "@/app/hooks/useSupabaseAuth";
import { useAuthLoadingState } from "@/app/hooks/useAuthLoadingState";
import { createWordList } from "@/app/services/wordListService";
import { SUBSCRIPTION_LIMITS } from "@/app/types";
import { ProtectedRoute } from "@/app/ui/auth/ProtectedRoute";
import { getClientSupabase } from "@/app/lib/supabase";

// Define our schema with Zod
const wordListSchema = z.object({
  name: z.string().min(1, "List name is required"),
  words: z.array(
    z.object({
      word: z.string().min(1, "Word is required").toUpperCase(),
      hint: z.string().optional(),
    })
  ).min(1, "At least one word is required"),
  is_public: z.boolean().default(false),
});

type WordListFormValues = z.infer<typeof wordListSchema>;

interface WordListSaveData {
  name: string;
  words: string[];
  hints?: string[];
  is_public?: boolean;
}

// Simplified direct insert function with minimal operations
async function saveWordListDirectly(userId: string, data: WordListSaveData) {
  console.log('Using simplified direct save method');
  
  if (!userId) {
    return { data: null, error: 'Missing user ID' };
  }
  
  try {
    // Get Supabase client
    const supabase = getClientSupabase();
    if (!supabase) {
      return { data: null, error: 'Failed to connect to database' };
    }
    
    // Keep it simple - just the essential fields to avoid timeouts
    const insertData = {
      user_id: userId,
      name: data.name,
      words: data.words,
      hints: data.hints || [],
      is_public: data.is_public || false,
    };
    
    console.log('Simplified insert data:', insertData);
    
    // Simple insert without .select() to reduce operation time
    const { error } = await supabase
      .from('word_lists')
      .insert(insertData);
    
    if (error) {
      console.error('Error in simplified insert:', error);
      return { data: null, error };
    }
    
    // Return minimal success data
    return { 
      data: { 
        id: 'created',
        name: data.name
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Exception in simplified insert:', error);
    return { data: null, error };
  }
}

function CreateWordListContent() {
  const router = useRouter();
  const { userId, subscriptionTier } = useSupabaseAuth();
  const { isVerifying } = useAuthLoadingState();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [saveStep, setSaveStep] = useState<string | null>(null);
  
  // Add a ref to track save timeouts
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any pending timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  // Get the noLists parameter from the URL
  const [noLists, setNoLists] = useState(false);
  
  useEffect(() => {
    // Check if we're in the browser and get the query parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setNoLists(params.get('noLists') === 'true');
    }
  }, []);
  
  // Initialize form with react-hook-form
  const { register, control, handleSubmit, formState: { errors } } = useForm<WordListFormValues>({
    resolver: zodResolver(wordListSchema),
    defaultValues: {
      name: '',
      words: [{ word: '', hint: '' }],
      is_public: false,
    },
  });
  
  // Use field array for dynamic words/hints
  const { fields, append, remove } = useFieldArray({
    control,
    name: "words",
  });

  // Get word limit for current subscription tier
  const wordLimit = SUBSCRIPTION_LIMITS[subscriptionTier].wordsPerListLimit;

  // Handle form submission
  const onSubmit: SubmitHandler<WordListFormValues> = async (data) => {
    console.log('Word list form submitted with data:', data);
    
    if (!userId) {
      console.error('No user ID available for creating word list');
      setErrorMessage('You must be logged in to create a word list');
      return;
    }
    
    console.log('Creating word list for user:', userId, 'with subscription tier:', subscriptionTier);
    setIsSaving(true);
    setErrorMessage(null);
    setSaveStep('Preparing data...');
    
    // Set a timeout to prevent infinite spinner
    const saveTimeout = setTimeout(() => {
      if (isSaving) {
        console.error('Save operation timed out');
        setIsSaving(false);
        setSaveStep(null);
        setErrorMessage('The operation timed out. Please try again.');
      }
    }, 20000); // 20 second timeout - give more time
    
    saveTimeoutRef.current = saveTimeout;
    
    try {
      // Skip session verification entirely - we already have a userId
      // No need for "if (!userId)" check anymore - we already checked above
      // Remove the verification step completely
      
      console.log('Preparing word list data for creation');
      setSaveStep('Processing word list...');
      const wordListData = {
        name: data.name,
        words: data.words.map(w => w.word.trim()),
        hints: data.words.map(w => w.hint?.trim() || ''),
        is_public: data.is_public,
      };
      console.log('Word list data prepared:', wordListData);
      
      // Simplified approach - try the direct save first
      console.log('Using simplified save approach');
      setSaveStep('Saving to database...');
      let result = await saveWordListDirectly(userId, wordListData);
      
      // Only try service function as fallback if direct save fails
      if (!result || result.error) {
        console.log('Direct save failed, trying service function');
        setSaveStep('Trying alternate save method...');
        
        try {
          const createResult = await createWordList(
            userId,
            wordListData,
            subscriptionTier,
            true // skipLimitChecks
          );
          
          // Transform the result to match the expected format
          if (createResult.data) {
            result = {
              data: {
                id: createResult.data.id,
                name: createResult.data.name
              },
              error: null
            };
          } else {
            result = { 
              data: null, 
              error: createResult.error 
            };
          }
        } catch (serviceError) {
          console.error('Service function failed with exception:', serviceError);
          result = { data: null, error: serviceError };
        }
      }
      
      // Clear the timeout since we got a response
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      
      if (!result || result.error) {
        console.error('Error from word list creation:', result?.error || 'No result returned');
        
        // Check if we're dealing with an empty error object
        if (result?.error && typeof result.error === 'object' && Object.keys(result.error).length === 0) {
          setErrorMessage('Network error occurred. Please try again later.');
        } else {
          // Handle specific error types
          let errorMessage = 'Failed to create word list';
          
          if (result && typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (result?.error && typeof result.error === 'object' && 'message' in result.error) {
            errorMessage = result.error.message as string;
          }
          
          // If we've had multiple failures, suggest the user try again later
          if (attempts >= 2) {
            setErrorMessage('We\'re having trouble saving your word list. Please try again later or contact support if the problem persists.');
            setIsSaving(false);
            setSaveStep(null);
            return;
          }
          
          // Check for common error patterns
          if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
            setErrorMessage('You already have a word list with this name. Please choose a different name.');
          } else if (errorMessage.includes('permission denied') || errorMessage.includes('not authorized')) {
            setErrorMessage('Permission denied. Please try logging out and back in.');
          } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            setErrorMessage('Network error. Please check your internet connection and try again.');
          } else {
            setErrorMessage(errorMessage);
          }
        }
        
        setAttempts(prev => prev + 1);
        setIsSaving(false);
        setSaveStep(null);
        return;
      }
      
      console.log('Word list created successfully:', result.data);
      setSaveStep('Success!');
      setSaveSuccess(true);
      setIsSaving(false);
      
      // Redirect to game page after successful save
      console.log('Setting redirect timeout');
      setSaveStep('Redirecting to game...');
      const redirectTimeout = setTimeout(() => {
        console.log('Redirecting to game page');
        router.push('/game');
      }, 1500);
      
      saveTimeoutRef.current = redirectTimeout;
    } catch (error) {
      console.error('Unexpected error saving word list:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setAttempts(prev => prev + 1);
      setIsSaving(false);
      setSaveStep(null);
      
      // Clear the timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
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
      
      {/* Display authentication verification message only if needed */}
      {isVerifying && (
        <div className="w-full max-w-xl bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-6 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-blue-700 dark:text-blue-300">Verifying your session...</span>
        </div>
      )}
      
      {/* Show saving progress indicator */}
      {isSaving && (
        <div className="w-full max-w-xl bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-3">
              <svg className="animate-spin h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-semibold text-blue-700 dark:text-blue-300">Saving your word list...</span>
            </div>
            {saveStep && (
              <span className="text-sm text-blue-600 dark:text-blue-300">{saveStep}</span>
            )}
            <div className="w-full mt-3 h-2 bg-blue-100 dark:bg-blue-800 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Subscription tier info */}
      <div className="w-full max-w-xl mb-6">
        <AlertMessage variant={subscriptionTier === 'free' ? 'warning' : 'info'}>
          <div className="flex flex-col">
            <span className="font-bold">
              {subscriptionTier === 'premium' 
                ? 'Premium Tier: Unlimited words and lists' 
                : subscriptionTier === 'basic'
                  ? `Basic Tier: Up to ${wordLimit} words per list`
                  : `Free Tier: Limited to ${wordLimit} words per list`}
            </span>
            {subscriptionTier !== 'premium' && (
              <span className="text-sm mt-1">
                <Link href="/pricing" className="underline hover:text-blue-600">
                  Upgrade your subscription
                </Link> for more words and features!
              </span>
            )}
          </div>
        </AlertMessage>
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <AlertMessage variant="destructive" className="w-full max-w-xl mb-6">
          <p>{errorMessage}</p>
        </AlertMessage>
      )}
      
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
                onClick={() => {
                  // Check if adding another word would exceed the limit
                  if (fields.length >= wordLimit && subscriptionTier !== 'premium') {
                    setErrorMessage(`You can only add up to ${wordLimit} words with your ${subscriptionTier} subscription. Please upgrade to add more.`);
                    return;
                  }
                  append({ word: '', hint: '' });
                  setErrorMessage(null);
                }}
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
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="is_public"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register("is_public")}
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Make this word list public (other users can discover and use it)
              </label>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center mt-8">
            <Link href={noLists ? "/" : "/game"}>
              <Button outline className="text-blue-600 hover:text-blue-700">
                {noLists ? "Back to Home" : "Cancel"}
              </Button>
            </Link>
            
            <Button 
              type="submit" 
              color="green"
              className="text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : "Save Word List"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function CreateWordListPage() {
  return (
    <ProtectedRoute>
      <CreateWordListContent />
    </ProtectedRoute>
  );
}