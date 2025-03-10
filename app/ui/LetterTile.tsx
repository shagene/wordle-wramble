'use client';

interface LetterTileProps {
  letter: string;
  status?: 'empty' | 'filled' | 'correct' | 'incorrect' | 'misplaced';
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  draggable?: boolean;
  isSlot?: boolean;
}

/**
 * LetterTile - A reusable component for letter tiles in the WordleGame
 * Handles different visual states based on game status
 */
const LetterTile = ({
  letter,
  status = 'empty',
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  draggable = false,
  isSlot = false,
}: LetterTileProps) => {
  // Determine the appropriate styling based on status
  const getStatusClasses = () => {
    switch (status) {
      case 'empty':
        return isSlot 
          ? 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800' 
          : 'bg-blue-500 dark:bg-blue-600 text-white';
      case 'filled':
        return isSlot
          ? 'border-2 border-blue-500 bg-blue-100 dark:bg-blue-900 dark:border-blue-400'
          : 'bg-blue-500 dark:bg-blue-600 text-white';
      case 'correct':
        return 'border-2 border-green-500 bg-green-100 dark:bg-green-900 dark:border-green-400 text-green-800 dark:text-green-200';
      case 'incorrect':
        return 'border-2 border-red-500 bg-red-100 dark:bg-red-900 dark:border-red-400 text-red-800 dark:text-red-200';
      case 'misplaced':
        return 'border-2 border-yellow-500 bg-yellow-100 dark:bg-yellow-900 dark:border-yellow-400 text-yellow-800 dark:text-yellow-200';
      default:
        return 'border-2 border-gray-300 dark:border-gray-600';
    }
  };

  // Determine cursor style
  const getCursorClass = () => {
    if (isSlot) {
      return letter ? 'cursor-pointer' : 'cursor-default';
    }
    return draggable ? 'cursor-grab' : 'cursor-default';
  };

  // Determine opacity for draggable letters that have been placed
  const getOpacityClass = () => {
    if (!isSlot && !draggable && status === 'empty') {
      return 'opacity-0';
    }
    return '';
  };

  return (
    <div
      className={`w-12 h-12 ${getStatusClasses()} ${getCursorClass()} ${getOpacityClass()} 
        rounded-md flex items-center justify-center text-2xl font-bold transition-all duration-200
        ${status === 'incorrect' ? 'animate-shake' : ''}`}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      draggable={draggable}
    >
      {letter}
    </div>
  );
};

export { LetterTile };
