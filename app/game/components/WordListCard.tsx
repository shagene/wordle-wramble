'use client';

import React, { useState, useEffect } from 'react';
import { WordList } from '../types';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '../../components/dialog';
import { Button } from '../../components/button';
import { useSupabaseAuth } from '@/app/hooks/useSupabaseAuth';
import { getUserWordProgress, deleteWordList } from '@/app/services/wordListService';

type WordListCardProps = {
  list: WordList;
  onClick?: () => void;
  onDelete?: (id: string) => void;
};

export function WordListCard({ list, onClick, onDelete }: WordListCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const { userId } = useSupabaseAuth();
  
  // Load progress from Supabase when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      // Skip loading if userId or list.id is missing
      if (!userId || !list.id) {
        console.log('Skipping progress load - missing userId or listId');
        setProgress(0);
        return;
      }
      
      try {
        console.log(`Loading progress for list: ${list.id}`);
        const { data, error } = await getUserWordProgress(userId, list.id);
        
        if (error) {
          const errorMsg = typeof error === 'string' 
            ? error 
            : error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
          console.error(`Error loading progress: ${errorMsg}`);
          // Don't crash on error, just show 0 progress
          setProgress(0);
          return;
        }
        
        // Calculate percentage of completed words - handle the case where data is null or empty
        if (data && Array.isArray(data) && data.length > 0) {
          const completedWords = data.filter(item => item.completed).length;
          const totalWords = list.words?.length || 1; // Prevent division by zero
          const percentage = Math.min(100, Math.round((completedWords / totalWords) * 100));
          console.log(`Progress calculation: ${completedWords}/${totalWords} = ${percentage}%`);
          setProgress(percentage);
        } else {
          // If no data or empty array, set progress to 0
          console.log('No progress data found, setting to 0%');
          setProgress(0);
        }
      } catch (error) {
        // Log the error but don't crash - provide user-friendly fallback
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Unhandled error in loadProgress: ${errorMsg}`);
        setProgress(0);
      }
    };
    
    // Run the progress loading function
    loadProgress().catch(err => {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Unhandled error in loadProgress promise: ${errorMsg}`);
      setProgress(0);
    });
  }, [list.id, list.words?.length, userId]);

  const handleDelete = (e: React.MouseEvent) => {
    // Prevent event bubbling to parent card
    e.preventDefault();
    e.stopPropagation();
    
    // Open the delete confirmation dialog
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userId || !list.id) {
      console.error('Cannot delete: missing userId or listId');
      return;
    }
    
    console.log(`Attempting to delete word list with ID: ${list.id}`);
    
    try {
      // Close the dialog immediately to improve perceived performance
      setIsDeleteDialogOpen(false);
      
      // Add a small delay to ensure UI updates before API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { success, error } = await deleteWordList(userId, list.id);
      
      if (error) {
        console.error(`Error deleting word list ${list.id}:`, error);
        alert('Failed to delete word list: ' + (typeof error === 'string' ? error : (error.message || 'Unknown error')));
        return;
      }
      
      if (success) {
        console.log(`Word list ${list.id} deleted successfully`);
        // Notify parent component about deletion
        if (onDelete) {
          onDelete(list.id);
        }
      } else {
        console.error(`Word list ${list.id} deletion reported no success but no error`);
        alert('Failed to delete word list. Please try again.');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Unexpected error deleting word list ${list.id}:`, errorMsg);
      alert('An unexpected error occurred while deleting the word list');
    }
  };

  // Get a category color based on word count
  const getCategoryColor = () => {
    if (list.words.length <= 5) return 'border-l-green-400';
    if (list.words.length <= 10) return 'border-l-blue-400';
    if (list.words.length <= 15) return 'border-l-purple-400';
    return 'border-l-red-400';
  };

  // Get difficulty level based on word length
  const getDifficultyLevel = () => {
    const avgLength = list.words.reduce((sum, word) => {
      const wordStr = typeof word === 'object' && word !== null ? 
        (word as { word: string }).word : String(word);
      return sum + wordStr.length;
    }, 0) / list.words.length;
    
    if (avgLength < 4) return 'Beginner';
    if (avgLength < 6) return 'Intermediate';
    return 'Advanced';
  };
  
  // Get progress message based on completion percentage
  const getProgressMessage = () => {
    if (progress === 0) return "Start practicing to track your progress!";
    if (progress < 50) return `${progress}% complete - Keep practicing!`;
    if (progress < 100) return `${progress}% complete - Almost there!`;
    return "100% complete - Well done!";
  };

  // Format date string for display
  const formatDate = () => {
    const date = list.created_at ? new Date(list.created_at) : new Date();
    return date.toLocaleDateString();
  };

  return (
    <>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-blue-400 border-l-8 ${getCategoryColor()} transition-all cursor-pointer animate-in fade-in relative group hover:shadow-lg transition-shadow`}
        onClick={(e) => {
          // Only handle card click if it's not on the delete button
          if (e.target instanceof HTMLElement && 
              !e.target.closest('button[aria-label]')) {
            onClick?.();
          }
        }}
      >
        <button
          className="absolute top-2 right-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-sm z-10"
          onClick={handleDelete}
          aria-label={`Delete ${list.name}`}
          data-color="red"
        >
          <span className="text-xl">🗑️</span>
        </button>
        
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2 pr-8">{list.name}</h3>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400 mr-1">📚</span>
            <p className="text-gray-600 dark:text-gray-300">{list.words.length} words</p>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400 mr-1">📅</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate()}</p>
          </div>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
            {getDifficultyLevel()}
          </span>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {getProgressMessage()}
          </p>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Word List</DialogTitle>
        <DialogBody>
          Are you sure you want to delete &ldquo;{list.name}&rdquo;? This action cannot be undone.
        </DialogBody>
        <DialogActions>
          <Button 
            color="zinc" 
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            color="red" 
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              confirmDelete();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
