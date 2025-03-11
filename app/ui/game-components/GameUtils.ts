'use client';

/**
 * Scrambles a word by randomly shuffling its letters
 * @param word The word to scramble
 * @returns An array of scrambled letters
 */
export function scrambleWord(word: string): string[] {
  const letters = word.split('');
  // Fisher-Yates shuffle algorithm
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters;
}

/**
 * Saves the user's progress to localStorage
 * @param listId The ID of the current word list
 * @param currentWord The word that was completed
 * @param attempts The number of attempts it took to complete
 * @param isDemo Whether the game is in demo mode
 */
export function saveProgress(listId: string, currentWord: string, attempts: number, isDemo: boolean): void {
  try {
    if (typeof window !== 'undefined' && !isDemo) {
      // Get existing progress or initialize empty object
      const progress = JSON.parse(localStorage.getItem('wordleProgress') || '{}');
      
      // Update progress for this list and word
      if (!progress[listId]) {
        progress[listId] = {};
      }
      
      // Store more detailed information about the completion
      progress[listId][currentWord] = {
        completed: true,
        attempts: attempts,
        timestamp: new Date().toISOString(),
        mastered: attempts <= 2, // Consider mastered if completed in 1-2 attempts
        stars: attempts === 1 ? 3 : attempts === 2 ? 2 : 1, // 3 stars for 1 attempt, 2 for 2, 1 for 3
      };
      
      // Save back to localStorage
      localStorage.setItem('wordleProgress', JSON.stringify(progress));
      
      // Also update total stats
      const stats = JSON.parse(localStorage.getItem('wordleStats') || '{}');
      stats.totalCompleted = (stats.totalCompleted || 0) + 1;
      stats.totalStars = (stats.totalStars || 0) + (attempts === 1 ? 3 : attempts === 2 ? 2 : 1);
      stats.lastPlayed = new Date().toISOString();
      localStorage.setItem('wordleStats', JSON.stringify(stats));
    }
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}
