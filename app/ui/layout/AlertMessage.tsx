import { ReactNode } from 'react';
import clsx from 'clsx';

type AlertVariant = 'info' | 'success' | 'warning' | 'destructive';

interface AlertMessageProps {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
}

export function AlertMessage({ children, variant = 'info', className }: AlertMessageProps) {
  const variantClasses = {
    info: 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
    success: 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800',
    destructive: 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
  };

  return (
    <div className={clsx(
      'rounded-lg p-4',
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  );
} 