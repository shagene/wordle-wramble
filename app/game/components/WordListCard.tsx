'use client';

import { useState, useEffect } from 'react';
import { WordList } from '../types';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '../../components/dialog';
import { Button } from '../../components/button';

type WordListCardProps = {
  list: WordList;
  onClick: (list: WordList) => void;
  onDelete?: (id: string) => void;
};

export function WordListCard({ list, onClick, onDelete }: WordListCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Load progress from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Get progress data from localStorage
        const progressData = JSON.parse(localStorage.getItem('wordleProgress') || '{}');
        const listProgress = progressData[list.id] || { completed: 0, attempts: 0 };
        
        // Calculate percentage (avoid division by zero)
        const percentage = listProgress.attempts > 0 
          ? Math.min(100, Math.round((listProgress.completed / list.words.length) * 100)) 
          : 0;
          
        setProgress(percentage);
      } catch (error) {
        console.error('Error loading progress:', error);
        setProgress(0);
      }
    }
  }, [list.id, list.words.length]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    try {
      const savedLists = JSON.parse(localStorage.getItem('wordLists') || '[]');
      const updatedLists = savedLists.filter((wordList: WordList) => wordList.id !== list.id);
      localStorage.setItem('wordLists', JSON.stringify(updatedLists));
      onDelete?.(list.id); // Trigger the parent's deletion logic
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting word list:', error);
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

  return (
    <>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-blue-400 border-l-8 ${getCategoryColor()} transition-all cursor-pointer animate-in fade-in relative group hover:shadow-lg transition-shadow`}
        onClick={() => onClick(list)}
      >
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 z-10"
          onClick={handleDelete}
          aria-label={`Delete ${list.name}`}
          data-color="red"
        >
          <span className="text-2xl">🗑️</span>
        </button>
        
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2 pr-8">{list.name}</h3>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400 mr-1">📚</span>
            <p className="text-gray-600 dark:text-gray-300">{list.words.length} words</p>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400 mr-1">📅</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(list.dateCreated).toLocaleDateString()}</p>
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
          <Button color="zinc" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
