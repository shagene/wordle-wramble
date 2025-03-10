'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { WordList } from '../types';

type GameContextType = {
  currentWordIndex: number;
  setCurrentWordIndex: (index: number) => void;
  wordList: WordList | null;
  setWordList: (list: WordList | null) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordList, setWordList] = useState<WordList | null>(null);

  return (
    <GameContext.Provider
      value={{
        currentWordIndex,
        setCurrentWordIndex,
        wordList,
        setWordList,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
