// Define achievement types
export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  color: string;
  unlocked: boolean;
  progress?: number;
};

// Define types for our progress tracking
export type WordProgress = {
  completed: boolean;
  attempts: number;
  timestamp: string;
  stars?: number;
};

export type ListProgress = {
  [wordId: string]: WordProgress;
};

export type AllProgress = {
  [listId: string]: ListProgress;
};

// Type for word list structure
export type WordList = {
  id: string;
  name: string;
  words: string[];
  hints?: string[];
  dateCreated: string;
};
