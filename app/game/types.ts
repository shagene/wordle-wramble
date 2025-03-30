// Define types for our word list structure
export type WordList = {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  is_public: boolean;
  words: string[];
  hints?: string[] | null;
  created_at: string;
  updated_at: string;
};

// Define types for word progress
export type WordProgress = {
  completed: boolean;
  attempts: number;
  timestamp: string;
  stars?: number;
};

// Define types for list progress
export type ListProgress = {
  [word: string]: WordProgress;
};

// Define types for overall progress
export type Progress = {
  [listId: string]: ListProgress;
};
