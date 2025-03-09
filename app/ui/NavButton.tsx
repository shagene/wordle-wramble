import { ReactNode } from 'react';
import { Button } from '../components/button';

/**
 * Navigation button component for the main menu
 * Provides consistent styling with customizable color, icon, and text
 */
interface NavButtonProps {
  color: 'blue' | 'green' | 'amber' | 'purple';
  href: string;
  icon: string;
  children: ReactNode;
  ariaLabel: string;
}

const NavButton = ({ color, href, icon, children, ariaLabel }: NavButtonProps) => {
  // Map of color to shadow color
  const shadowColors = {
    blue: 'shadow-blue-200 dark:shadow-blue-900',
    green: 'shadow-green-200 dark:shadow-green-900',
    amber: 'shadow-yellow-200 dark:shadow-yellow-900',
    purple: 'shadow-purple-200 dark:shadow-purple-900',
  };

  return (
    <Button
      color={color}
      href={href}
      className={`font-[family-name:var(--font-bubblegum-sans)] text-xl h-28 shadow-lg ${shadowColors[color]} hover:scale-105 transition-transform duration-300`}
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <span className="text-3xl mb-1">{icon}</span>
        <span className="text-2xl">{children}</span>
      </div>
    </Button>
  );
};

export { NavButton };
