import { getClientSupabase } from '@/app/lib/supabase';
import { WordList, SUBSCRIPTION_LIMITS, SubscriptionTier } from '@/app/types';

type ServiceError = string | Error | {
  code?: string;
  message: string;
  details?: string;
};

/**
 * Gets the Supabase client instance.
 * Throws an error if the client cannot be obtained (e.g., called server-side without context).
 */
const getSupabase = () => {
  const supabase = getClientSupabase();
  if (!supabase) {
    throw new Error('Supabase client is not available. This function might be called server-side without proper context.');
  }
  return supabase;
};

/**
 * Get all word lists for a user
 */
export async function getUserWordLists(userId: string): Promise<{ data: WordList[] | null, error: ServiceError | null }> {
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('word_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching word lists:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : 'Error fetching word lists'
    };
  }
}

/**
 * Get a specific word list by ID
 */
export async function getWordList(listId: string, userId: string): Promise<{ data: WordList | null, error: ServiceError | null }> {
  if (!listId) {
    return { data: null, error: 'List ID is required' };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('word_lists')
      .select('*')
      .eq('id', listId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching word list:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : 'Error fetching word list'
    };
  }
}

/**
 * Create a new word list with subscription tier enforcement
 */
export async function createWordList(
  userId: string, 
  wordList: { 
    name: string, 
    words: string[], 
    hints?: string[] | null,
    description?: string | null,
    is_public?: boolean 
  },
  subscriptionTier: SubscriptionTier = 'free',
  skipLimitChecks: boolean = false
): Promise<{ data: WordList | null, error: ServiceError | null }> {
  console.log('createWordList: Starting with userId:', userId, 'and tier:', subscriptionTier);
  console.log('createWordList: Word list data:', wordList);
  
  if (!userId) {
    console.error('createWordList: No userId provided');
    return { data: null, error: 'User ID is required' };
  }

  // If skipLimitChecks is true, use a simplified approach
  if (skipLimitChecks) {
    console.log('createWordList: Skipping limit checks for faster operation');
    try {
      // Just do a simple insert without the extra queries
      const insertData = {
        user_id: userId,
        name: wordList.name,
        description: wordList.description || null,
        is_public: wordList.is_public || false,
        words: wordList.words,
        hints: wordList.hints || [],
      };
      
      console.log('createWordList: Using simplified insert data:', insertData);
      
      const { error } = await getSupabase()
        .from('word_lists')
        .insert(insertData);
        
      if (error) {
        console.error('createWordList: Error from simplified insert:', error);
        return { data: null, error };
      }
      
      // Return minimal data just to indicate success
      return { 
        data: { 
          id: 'created', 
          name: wordList.name,
          user_id: userId,
          words: wordList.words.slice(0, 1),  // Just include first word for type safety
          created_at: new Date().toISOString()
        } as WordList, 
        error: null 
      };
    } catch (error) {
      console.error('createWordList: Error in simplified approach:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : 'Error in creating word list'
      };
    }
  }

  // Create a timeout promise to prevent hanging requests
  const timeoutPromise = new Promise<{ data: null, error: ServiceError }>((resolve) => {
    setTimeout(() => {
      console.error('createWordList: Operation timed out');
      resolve({ data: null, error: 'The operation timed out. Please try again.' });
    }, 10000); // 10 second timeout
  });

  try {
    // The main operation as a promise
    const operationPromise = (async () => {
      try {
        // Get user's existing word lists count to enforce limits
        console.log('createWordList: Checking existing lists count');
        const { data: existingLists, error: countError } = await getSupabase()
          .from('word_lists')
          .select('id')
          .eq('user_id', userId);
          
        if (countError) {
          console.error('createWordList: Error fetching existing lists:', countError);
          return { data: null, error: countError };
        }
          
        console.log('createWordList: Found', existingLists?.length || 0, 'existing lists');
        
        // Check word list count limit based on subscription tier
        const listLimit = SUBSCRIPTION_LIMITS[subscriptionTier].wordListsLimit;
        console.log('createWordList: List limit for tier', subscriptionTier, 'is', listLimit);
        
        if (existingLists.length >= listLimit) {
          console.error('createWordList: List limit exceeded');
          return { 
            data: null, 
            error: `You've reached the maximum number of word lists (${listLimit}) for your subscription tier. Please upgrade to create more lists.` 
          };
        }
        
        // Check word count limit based on subscription tier
        const wordLimit = SUBSCRIPTION_LIMITS[subscriptionTier].wordsPerListLimit;
        console.log('createWordList: Word limit for tier', subscriptionTier, 'is', wordLimit);
        
        if (wordList.words.length > wordLimit) {
          console.error('createWordList: Word limit exceeded');
          return { 
            data: null, 
            error: `You've exceeded the maximum number of words (${wordLimit}) per list for your subscription tier. Please upgrade to add more words.` 
          };
        }
        
        // Create the new word list
        console.log('createWordList: All checks passed, creating word list in Supabase');
        const insertData = {
          user_id: userId,
          name: wordList.name,
          description: wordList.description || null,
          is_public: wordList.is_public || false,
          words: wordList.words,
          hints: wordList.hints || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log('createWordList: Insert data:', insertData);
        
        const { data, error } = await getSupabase()
          .from('word_lists')
          .insert(insertData)
          .select()
          .single();
          
        if (error) {
          console.error('createWordList: Error from Supabase insert:', error);
          return { data: null, error };
        }
        
        if (!data) {
          console.warn('createWordList: No data returned from insert, but no error');
          return { 
            data: { 
              id: 'pending',
              user_id: userId,
              name: wordList.name, 
              words: wordList.words,
              hints: wordList.hints || [],
              is_public: wordList.is_public || false,
              created_at: new Date().toISOString()
            } as WordList, 
            error: null 
          };
        }
        
        console.log('createWordList: Word list created successfully:', data);
        return { data, error: null };
      } catch (innerError) {
        console.error('createWordList: Inner operation error:', innerError);
        return { 
          data: null, 
          error: innerError instanceof Error 
            ? innerError
            : 'An unexpected error occurred' 
        };
      }
    })();
    
    // Race the operation against the timeout
    return await Promise.race([operationPromise, timeoutPromise]);
  } catch (error) {
    console.error('createWordList: Unexpected error:', error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? error
        : 'An unexpected error occurred during word list creation' 
    };
  }
}

/**
 * Update an existing word list with subscription tier enforcement
 */
export async function updateWordList(
  userId: string,
  listId: string,
  updates: {
    name?: string,
    description?: string | null,
    is_public?: boolean,
    words?: string[],
    hints?: string[] | null
  },
  subscriptionTier: SubscriptionTier = 'free'
): Promise<{ data: WordList | null, error: ServiceError | null }> {
  if (!userId || !listId) {
    return { data: null, error: 'User ID and List ID are required' };
  }

  try {
    // First get the current word list to check ownership
    const supabase = getSupabase();
    const { data: currentList, error: fetchError } = await supabase
      .from('word_lists')
      .select('*')
      .eq('id', listId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    if (!currentList) {
      return { data: null, error: 'Word list not found or you do not have permission to edit it' };
    }
    
    // Check word count limit if words are being updated
    if (updates.words) {
      const wordLimit = SUBSCRIPTION_LIMITS[subscriptionTier].wordsPerListLimit;
      if (updates.words.length > wordLimit) {
        return { 
          data: null, 
          error: `You've exceeded the maximum number of words (${wordLimit}) per list for your subscription tier. Please upgrade to add more words.` 
        };
      }
    }
    
    // Perform the update
    const { data, error } = await supabase
      .from('word_lists')
      .update({
        name: updates.name || currentList.name,
        description: updates.description !== undefined ? updates.description : currentList.description,
        is_public: updates.is_public !== undefined ? updates.is_public : currentList.is_public,
        words: updates.words || currentList.words,
        hints: updates.hints !== undefined ? updates.hints : currentList.hints,
        updated_at: new Date().toISOString()
      })
      .eq('id', listId)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating word list:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : 'Error updating word list'
    };
  }
}

/**
 * Delete a word list
 */
export async function deleteWordList(userId: string, listId: string): Promise<{ success: boolean, error: ServiceError | null }> {
  if (!userId || !listId) {
    return { success: false, error: 'User ID and List ID are required' };
  }

  console.log(`deleteWordList: Starting deletion process for list ${listId} by user ${userId}`);
  
  try {
    // First check if the list belongs to the user
    console.log(`deleteWordList: Verifying list ownership for list ${listId}`);
    const supabase = getSupabase();
    const { data, error: fetchError } = await supabase
      .from('word_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', userId)
      .single();
      
    // Handle fetch errors
    if (fetchError) {
      console.error('deleteWordList: Error checking list ownership:', fetchError);
      const errorMessage = fetchError.message || fetchError.code || JSON.stringify(fetchError);
      return { success: false, error: `Failed to verify ownership: ${errorMessage}` };
    }
    
    // Handle missing list
    if (!data) {
      console.error(`deleteWordList: List ${listId} not found or not owned by user ${userId}`);
      return { 
        success: false, 
        error: 'Word list not found or you do not have permission to delete it' 
      };
    }
    
    // Delete the word list
    console.log(`deleteWordList: Ownership verified, proceeding with deletion of list ${listId}`);
    const { error } = await supabase
      .from('word_lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', userId);
      
    // Handle deletion errors
    if (error) {
      console.error(`deleteWordList: Error deleting list ${listId}:`, error);
      const errorMessage = error.message || error.code || JSON.stringify(error);
      return { success: false, error: `Failed to delete: ${errorMessage}` };
    }
    
    // Success case
    console.log(`deleteWordList: Successfully deleted list ${listId}`);
    return { success: true, error: null };
    
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`deleteWordList: Unexpected error deleting list ${listId}:`, errorMessage);
    return { 
      success: false, 
      error: `Unexpected error: ${errorMessage}` 
    };
  }
}

/**
 * Get public word lists with pagination
 */
export async function getPublicWordLists(limit = 10, page = 1): Promise<{ data: WordList[] | null, error: ServiceError | null }> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('word_lists')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching public word lists:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : 'Error fetching public word lists'
    };
  }
}

/**
 * Search for word lists by name or description
 */
export async function searchWordLists(
  userId: string, 
  query: string
): Promise<{ data: WordList[] | null, error: ServiceError | null }> {
  if (!userId) {
    return { data: null, error: 'User ID is required' };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('word_lists')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error searching word lists:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : 'Error searching word lists'
    };
  }
}

interface WordProgress {
  userId: string;
  listId: string;
  word: string;
  attempts: number;
  completed: boolean;
  timestamp: string;
}

export async function updateWordProgress(progress: WordProgress) {
  return await getSupabase()
    .from('word_progress')
    .upsert({
      user_id: progress.userId,
      list_id: progress.listId,
      word: progress.word,
      attempts: progress.attempts,
      completed: progress.completed,
      timestamp: progress.timestamp
    }, {
      onConflict: 'user_id,list_id,word'
    })
    .select()
    .single();
}

// Fetch all progress for a user across all word lists
export async function getUserProgress(userId: string) {
  return await getSupabase()
    .from('word_progress')
    .select('*')
    .eq('user_id', userId);
}

// Fetch progress for a specific word list
export async function getUserWordProgress(userId: string, listId: string) {
  if (!userId || !listId) {
    console.warn('getUserWordProgress called without userId or listId');
    return { data: [], error: null };
  }

  try {
    console.log(`Fetching progress for user ${userId} and list ${listId}`);
    const supabase = getSupabase();
    const response = await supabase
      .from('word_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('list_id', listId);
      
    // Check if response is valid
    if (!response) {
      console.error('getUserWordProgress: Invalid response from Supabase');
      return { data: [], error: null };
    }
    
    // Handle the case where table doesn't exist yet
    if (response.error && 
        response.error.message && 
        response.error.message.includes('does not exist')) {
      console.warn('getUserWordProgress: Table word_progress does not exist yet, returning empty array');
      return { data: [], error: null };
    }
    
    // Handle other errors
    if (response.error) {
      console.error('Supabase error in getUserWordProgress:', 
        response.error.message || response.error.code || JSON.stringify(response.error));
      return { data: [], error: response.error };
    }
    
    // Ensure data is always an array
    const progressData = Array.isArray(response.data) ? response.data : [];
    console.log(`Found ${progressData.length} progress records`);
    
    return { 
      data: progressData, 
      error: null 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error in getUserWordProgress:', errorMessage);
    // Return empty array instead of error to prevent UI breaks
    return { data: [], error: null };
  }
} 