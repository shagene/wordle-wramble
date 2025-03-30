'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '@/app/ui/errors/ErrorBoundary';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
} 