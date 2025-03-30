-- Create the word_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.word_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.word_lists(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add a unique constraint to prevent duplicates
  UNIQUE(user_id, list_id, word)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS word_progress_user_id_idx ON public.word_progress(user_id);
CREATE INDEX IF NOT EXISTS word_progress_list_id_idx ON public.word_progress(list_id);
CREATE INDEX IF NOT EXISTS word_progress_completed_idx ON public.word_progress(completed);

-- Add RLS policies
ALTER TABLE public.word_progress ENABLE ROW LEVEL SECURITY;

-- Policy for selecting records (users can only see their own progress)
CREATE POLICY word_progress_select_policy
  ON public.word_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for inserting records (users can only insert their own progress)
CREATE POLICY word_progress_insert_policy
  ON public.word_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating records (users can only update their own progress)
CREATE POLICY word_progress_update_policy
  ON public.word_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for deleting records (users can only delete their own progress)
CREATE POLICY word_progress_delete_policy
  ON public.word_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comment on table and columns for documentation
COMMENT ON TABLE public.word_progress IS 'Tracks user progress on individual words within word lists';
COMMENT ON COLUMN public.word_progress.user_id IS 'The user who is tracking progress';
COMMENT ON COLUMN public.word_progress.list_id IS 'The word list containing the word';
COMMENT ON COLUMN public.word_progress.word IS 'The specific word being tracked';
COMMENT ON COLUMN public.word_progress.attempts IS 'Number of attempts made on this word';
COMMENT ON COLUMN public.word_progress.completed IS 'Whether the user has successfully completed this word';
COMMENT ON COLUMN public.word_progress.timestamp IS 'When the progress was last updated'; 