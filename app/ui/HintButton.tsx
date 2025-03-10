'use client';

import { ReactNode } from 'react';

interface HintButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  color?: 'amber' | 'blue' | 'green' | 'purple';
  usesRemaining?: number;
}

/**
 * HintButton - A reusable button component for different types of hints
 */
const HintButton = ({ 
  onClick, 
  disabled = false, 
  icon, 
  label, 
  color = 'amber',
  usesRemaining
}: HintButtonProps) => {
  // Color classes based on the color prop
  const colorClasses = {
    amber: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300',
    blue: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300',
    green: 'bg-green-500 hover:bg-green-600 focus:ring-green-300',
    purple: 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colorClasses[color]} relative text-white rounded-full p-2 transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105 active:scale-95'}`}
      aria-label={label}
      title={label}
    >
      <span className="text-xl">{icon}</span>
      
      {/* Uses remaining indicator */}
      {usesRemaining !== undefined && (
        <span className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-gray-800">
          {usesRemaining}
        </span>
      )}
    </button>
  );
};

export { HintButton };
