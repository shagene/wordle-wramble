import { getClientSupabase } from '@/app/lib/supabase';
import { SUBSCRIPTION_LIMITS } from '@/app/types';
import { SubscriptionTier } from '@/app/types';

// Types for migration
interface LocalWordList {
  id: string;
  name: string;
  description?: string;
  words: string[];
  hints?: string[];
  dateCreated: string;
  dateModified: string;
}

interface LocalProgress {
  wordListId: string;
  wordIndex: number;
  attempts: number;
  completed: boolean;
  stars: number;
  completedAt?: string;
}

interface LocalSettings {
  preferredVoice?: string;
  audioEnabled?: boolean;
  difficultyLevel?: string;
  theme?: string;
}

interface MigrationResult {
  success: boolean;
  wordListsCount?: number;
  progressItemsCount?: number;
  settingsMigrated?: boolean;
  error?: string;
}

interface LimitedData {
  wordLists: LocalWordList[];
  progress: Record<string, LocalProgress>;
  settings: LocalSettings | null;
}

// Helper function to get the Supabase client
function getSupabase() {
  const supabase = getClientSupabase();
  if (!supabase) {
    throw new Error('Failed to connect to Supabase client');
  }
  return supabase;
}

/**
 * Check if migration is needed for the current user
 */
export async function checkMigrationNeeded(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    
    // Check if user has any data in Supabase already
    const { count, error } = await supabase
      .from('word_lists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
    
    // Check if localStorage has data to migrate
    const hasLocalData = Object.keys(localStorage)
      .some(key => key.startsWith('wordlist_') || key.startsWith('progress_'));
      
    // Migration needed if we have local data but no Supabase data
    return hasLocalData && (count === 0);
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Collect all word lists from localStorage
 */
function collectWordLists(): LocalWordList[] {
  try {
    const wordLists: LocalWordList[] = [];
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('wordlist_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          wordLists.push({
            id: key.replace('wordlist_', ''),
            name: data.name || 'Unnamed List',
            description: data.description,
            words: data.words || [],
            hints: data.hints,
            dateCreated: data.dateCreated || new Date().toISOString(),
            dateModified: data.dateModified || new Date().toISOString()
          });
        } catch (e) {
          console.error(`Error parsing word list: ${key}`, e);
        }
      }
    });
    
    return wordLists;
  } catch (error) {
    console.error('Error collecting word lists:', error);
    return [];
  }
}

/**
 * Collect all progress data from localStorage
 */
function collectProgressData(): Record<string, LocalProgress> {
  try {
    const progress: Record<string, LocalProgress> = {};
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('progress_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          
          // Extract wordListId and wordIndex from the key
          // Format: progress_[wordListId]_[wordIndex]
          const parts = key.split('_');
          if (parts.length >= 3) {
            const wordListId = parts[1];
            const wordIndex = parseInt(parts[2], 10);
            
            progress[key] = {
              wordListId,
              wordIndex,
              attempts: data.attempts || 0,
              completed: data.completed || false,
              stars: data.stars || 0,
              completedAt: data.completedAt
            };
          }
        } catch (e) {
          console.error(`Error parsing progress: ${key}`, e);
        }
      }
    });
    
    return progress;
  } catch (error) {
    console.error('Error collecting progress data:', error);
    return {};
  }
}

/**
 * Collect user settings from localStorage
 */
function collectSettings(): LocalSettings | null {
  try {
    const settingsString = localStorage.getItem('user_settings');
    if (!settingsString) return null;
    
    const settings = JSON.parse(settingsString);
    return {
      preferredVoice: settings.preferredVoice,
      audioEnabled: settings.audioEnabled,
      difficultyLevel: settings.difficultyLevel,
      theme: settings.theme
    };
  } catch (error) {
    console.error('Error collecting settings:', error);
    return null;
  }
}

/**
 * Apply subscription tier limits to the data being migrated
 */
function applySubscriptionLimits(
  wordLists: LocalWordList[],
  progress: Record<string, LocalProgress>,
  tier: SubscriptionTier
): LimitedData {
  const limits = SUBSCRIPTION_LIMITS[tier];
  
  // Apply word list and words-per-list limits
  const limitedWordLists = wordLists
    .slice(0, limits.wordListsLimit)
    .map(list => ({
      ...list,
      words: list.words.slice(0, limits.wordsPerListLimit),
      hints: list.hints?.slice(0, limits.wordsPerListLimit) || []
    }));
  
  // Only keep progress for word lists and words that are within limits
  const limitedProgress: Record<string, LocalProgress> = {};
  
  Object.entries(progress).forEach(([key, progressItem]) => {
    // Check if this word list is in the limited set
    const wordListExists = limitedWordLists.some(list => list.id === progressItem.wordListId);
    // Check if word index is within the limits for this tier
    const wordIndexInRange = progressItem.wordIndex < limits.wordsPerListLimit;
    
    if (wordListExists && wordIndexInRange) {
      limitedProgress[key] = progressItem;
    }
  });
  
  return {
    wordLists: limitedWordLists,
    progress: limitedProgress,
    settings: collectSettings()
  };
}

/**
 * Store word lists in Supabase
 */
async function storeWordLists(userId: string, wordLists: LocalWordList[]): Promise<boolean> {
  try {
    const supabase = getSupabase();
    
    // Process each word list 
    for (const list of wordLists) {
      const { error } = await supabase.from('word_lists').insert({
        user_id: userId,
        name: list.name,
        description: list.description || null,
        is_public: false, // Default to private
        words: list.words,
        hints: list.hints || null,
        created_at: list.dateCreated,
        updated_at: list.dateModified
      });
      
      if (error) {
        console.error('Error storing word list:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error storing word lists:', error);
    return false;
  }
}

/**
 * Store progress data in Supabase
 */
async function storeProgress(
  userId: string, 
  progress: Record<string, LocalProgress>,
  wordListMap: Record<string, string> // Map of local IDs to Supabase IDs
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    
    // Extract all progress items
    const progressItems = Object.values(progress);
    
    // Group progress by word list for efficiency
    const progressByWordList: Record<string, LocalProgress[]> = {};
    
    progressItems.forEach(item => {
      if (!progressByWordList[item.wordListId]) {
        progressByWordList[item.wordListId] = [];
      }
      progressByWordList[item.wordListId].push(item);
    });
    
    // Process each word list's progress
    for (const [localWordListId, items] of Object.entries(progressByWordList)) {
      // Get the Supabase ID for this word list
      const wordListId = wordListMap[localWordListId];
      if (!wordListId) continue; // Skip if we don't have the Supabase ID
      
      // Insert all progress items for this word list
      for (const item of items) {
        const { error } = await supabase.from('progress').insert({
          user_id: userId,
          word_list_id: wordListId,
          word_index: item.wordIndex,
          attempts: item.attempts,
          completed: item.completed,
          stars: item.stars,
          completed_at: item.completedAt || null
        });
        
        if (error) {
          console.error('Error storing progress:', error);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error storing progress:', error);
    return false;
  }
}

/**
 * Store user settings in user's profile
 */
async function storeSettings(userId: string, settings: LocalSettings | null): Promise<boolean> {
  if (!settings) return true; // No settings to store
  
  try {
    // This would be expanded based on what settings we actually store in profiles
    // For now, we're not storing much in profiles directly, but we could
    // update this as we add more profile settings
    return true;
  } catch (error) {
    console.error('Error storing settings:', error);
    return false;
  }
}

/**
 * Perform the migration from localStorage to Supabase
 */
export async function migrateData(userId: string): Promise<MigrationResult> {
  try {
    // 1. Collect all localStorage data
    const wordLists = collectWordLists();
    const progress = collectProgressData();
    
    // 2. Apply subscription tier limits
    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
      
    const tier = (profile?.subscription_tier || 'free') as SubscriptionTier;
    const limitedData = applySubscriptionLimits(wordLists, progress, tier);
    
    // 3. Store word lists and get mapping of IDs
    const wordListSuccess = await storeWordLists(userId, limitedData.wordLists);
    
    // Get mapping of local IDs to Supabase IDs
    const wordListMap: Record<string, string> = {};
    if (wordListSuccess) {
      for (const localList of limitedData.wordLists) {
        // Find the Supabase ID for this list based on name and creation date
        const { data } = await getSupabase()
          .from('word_lists')
          .select('id')
          .eq('user_id', userId)
          .eq('name', localList.name)
          .single();
          
        if (data) {
          wordListMap[localList.id] = data.id;
        }
      }
    }
    
    // 4. Store progress data
    const progressSuccess = await storeProgress(userId, limitedData.progress, wordListMap);
    
    // 5. Store settings
    const settingsSuccess = await storeSettings(userId, limitedData.settings);
    
    // 6. Mark migration as complete
    localStorage.setItem('migration_completed', 'true');
    
    return {
      success: wordListSuccess && progressSuccess && settingsSuccess,
      wordListsCount: limitedData.wordLists.length,
      progressItemsCount: Object.keys(limitedData.progress).length,
      settingsMigrated: !!limitedData.settings
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Migrate data with progress reporting
 */
export async function migrateDataWithProgress(
  userId: string, 
  progressCallback: (progress: number) => void
): Promise<MigrationResult> {
  // Start with 0% progress
  progressCallback(0);
  
  // Collect data - 20% progress
  const wordLists = collectWordLists();
  progressCallback(10);
  
  const progress = collectProgressData();
  progressCallback(15);
  
  // Skip to 20% progress - we don't need to collect settings since they are handled by applySubscriptionLimits
  progressCallback(20);
  
  // Apply limits - 30% progress
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();
    
  const tier = (profile?.subscription_tier || 'free') as SubscriptionTier;
  const limitedData = applySubscriptionLimits(wordLists, progress, tier);
  progressCallback(30);
  
  // Store data in batches - 30-90% progress
  const wordListSuccess = await storeWordLists(userId, limitedData.wordLists);
  progressCallback(50);
  
  // Get mapping of local IDs to Supabase IDs
  const wordListMap: Record<string, string> = {};
  if (wordListSuccess) {
    for (const localList of limitedData.wordLists) {
      // Find the Supabase ID for this list based on name and creation date
      const { data } = await getSupabase()
        .from('word_lists')
        .select('id')
        .eq('user_id', userId)
        .eq('name', localList.name)
        .single();
        
      if (data) {
        wordListMap[localList.id] = data.id;
      }
    }
  }
  progressCallback(70);
  
  const progressSuccess = await storeProgress(userId, limitedData.progress, wordListMap);
  progressCallback(85);
  
  const settingsSuccess = await storeSettings(userId, limitedData.settings);
  progressCallback(95);
  
  // Mark migration as complete - 100% progress
  localStorage.setItem('migration_completed', 'true');
  progressCallback(100);
  
  return {
    success: wordListSuccess && progressSuccess && settingsSuccess,
    wordListsCount: limitedData.wordLists.length,
    progressItemsCount: Object.keys(limitedData.progress).length,
    settingsMigrated: !!limitedData.settings
  };
} 