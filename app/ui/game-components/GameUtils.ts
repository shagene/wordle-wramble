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
 * Saves the user's progress to Supabase or falls back to localStorage
 * @param listId The ID of the current word list
 * @param currentWord The word that was completed
 * @param attempts The number of attempts it took to complete
 * @param isDemo Whether the game is in demo mode
 * @param userId Optional user ID for Supabase storage
 */
export async function saveProgress(
  listId: string, 
  currentWord: string, 
  attempts: number, 
  isDemo: boolean,
  userId?: string | null
): Promise<void> {
  try {
    // Don't save progress in demo mode
    if (isDemo) return;

    // Save to Supabase if user is authenticated
    if (userId) {
      try {
        // Dynamically import the service to avoid circular dependencies
        const { updateWordProgress } = await import('@/app/services/wordListService');
        
        // Update progress in Supabase
        await updateWordProgress({
          userId,
          listId,
          word: currentWord,
          attempts,
          completed: true,
          timestamp: new Date().toISOString()
        });
        
        console.log('Progress saved to Supabase');
        return; // Exit early if Supabase save was successful
      } catch (error) {
        console.error('Error saving progress to Supabase:', error);
        // Fall back to localStorage if Supabase fails
      }
    }
    
    // Fallback to localStorage (for anonymous users or if Supabase fails)
    if (typeof window !== 'undefined') {
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
      
      console.log('Progress saved to localStorage');
    }
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}
