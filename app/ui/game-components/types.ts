export type LetterStatus = 'empty' | 'filled' | 'correct' | 'incorrect' | 'misplaced';

export interface WordResult {
  word: string;
  attempts: number;
  completed: boolean;
}

export interface WordleGameProps {
  words?: string[];
  hints?: string[];
  isDemo?: boolean;
  onComplete?: (word: string, attempts: number) => void;
}

// Voice interface for audio services
export interface Voice {
  voice_id: string;
  name: string;
}
