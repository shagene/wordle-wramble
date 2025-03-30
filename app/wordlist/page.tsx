"use client";

import { useState, useEffect } from 'react';
import { Heading } from "../components/heading";
import { Button } from "../components/button";
import { AlertMessage } from "@/app/ui/layout/AlertMessage";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from "@/app/hooks/useSupabaseAuth";
import { getUserWordLists, deleteWordList } from "@/app/services/wordListService";
import { SUBSCRIPTION_LIMITS } from "@/app/types";
import { WordList } from '@/app/types';
import { ProtectedRoute } from "@/app/ui/auth/ProtectedRoute";

function WordListContent() {
  const router = useRouter();
  const { userId, subscriptionTier } = useSupabaseAuth();
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch word lists from Supabase when authenticated
  useEffect(() => {
    const fetchWordLists = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await getUserWordLists(userId);
        
        if (error) {
          console.error('Error fetching word lists:', error);
          setError('Failed to load your word lists. Please try again later.');
          return;
        }
        
        setWordLists(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWordLists();
  }, [userId]);

  // Handle word list deletion
  const handleDelete = async (listId: string) => {
    if (deleteConfirm !== listId) {
      setDeleteConfirm(listId);
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const { success, error } = await deleteWordList(userId as string, listId);
      
      if (error) {
        console.error('Error deleting word list:', error);
        setError('Failed to delete word list. Please try again.');
        setIsDeleting(false);
        return;
      }
      
      if (success) {
        // Remove the deleted list from state
        setWordLists(wordLists.filter(list => list.id !== listId));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Unexpected error during deletion:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Get list limit for current subscription tier
  const listLimit = SUBSCRIPTION_LIMITS[subscriptionTier].wordListsLimit;
  const canCreateMoreLists = wordLists.length < listLimit || subscriptionTier === 'premium';

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <Heading level={1} className="mb-4 sm:mb-0 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          My Word Lists
        </Heading>
        
        <div className="flex gap-4">
          <Button 
            color="green" 
            className="text-white"
            disabled={!canCreateMoreLists}
            onClick={() => router.push('/wordlist/create')}
          >
            Create New List
          </Button>
        </div>
      </div>
      
      {/* Subscription tier info */}
      <div className="mb-6">
        <AlertMessage variant={subscriptionTier === 'free' ? 'warning' : 'info'}>
          <div className="flex flex-col">
            <span className="font-bold">
              {subscriptionTier === 'premium' 
                ? 'Premium Tier: Unlimited word lists' 
                : `${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Tier: ${wordLists.length}/${listLimit} word lists used`}
            </span>
            {subscriptionTier !== 'premium' && (
              <span className="text-sm mt-1">
                <Link href="/pricing" className="underline hover:text-blue-600">
                  Upgrade your subscription
                </Link> for more word lists and features!
              </span>
            )}
          </div>
        </AlertMessage>
      </div>
      
      {/* Error message */}
      {error && (
        <AlertMessage variant="destructive" className="mb-6">
          <p>{error}</p>
        </AlertMessage>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin text-4xl">⌛</div>
        </div>
      ) : (
        <>
          {wordLists.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-xl font-semibold mb-2">No Word Lists Yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first word list to start practicing!
              </p>
              <Button 
                color="green" 
                className="text-white"
                onClick={() => router.push('/wordlist/create')}
              >
                Create Your First List
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wordLists.map((list) => (
                <div 
                  key={list.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                        {list.name}
                      </h3>
                      {list.is_public && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                          Public
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {list.words.length} word{list.words.length !== 1 ? 's' : ''}
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(list.created_at).toLocaleDateString()}
                    </div>
                    
                    <div className="mt-6 flex gap-2">
                      {deleteConfirm === list.id ? (
                        <>
                          <Button 
                            color="red" 
                            className="text-white"
                            onClick={() => handleDelete(list.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                          </Button>
                          <Button 
                            outline
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            color="blue"
                            className="text-white"
                            onClick={() => router.push(`/game?listId=${list.id}`)}
                          >
                            Play
                          </Button>
                          <Button
                            outline
                            onClick={() => router.push(`/wordlist/edit/${list.id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            color="red"
                            className="text-white"
                            onClick={() => handleDelete(list.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Create more button at bottom for convenience */}
          {canCreateMoreLists && wordLists.length > 0 && (
            <div className="mt-10 text-center">
              <Button 
                color="green" 
                className="text-white"
                onClick={() => router.push('/wordlist/create')}
              >
                Create Another List
              </Button>
            </div>
          )}
          
          {/* Limit reached message */}
          {wordLists.length > 0 && !canCreateMoreLists && (
            <div className="mt-8">
              <AlertMessage variant="warning">
                <p className="text-center">
                  You&apos;ve reached the maximum number of word lists ({listLimit}) for your subscription tier.{' '}
                  <Link href="/pricing" className="underline hover:text-blue-600">
                    Upgrade your subscription
                  </Link> to create more lists!
                </p>
              </AlertMessage>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function WordListPage() {
  return (
    <ProtectedRoute>
      <WordListContent />
    </ProtectedRoute>
  );
}
