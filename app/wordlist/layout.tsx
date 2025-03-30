'use client';

import { ReactNode } from 'react';
import { RouteGuard } from '@/app/providers/auth/RouteGuard';
import { ErrorBoundary } from '@/app/ui/errors/ErrorBoundary';

export default function WordlistLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <RouteGuard>
        {children}
      </RouteGuard>
    </ErrorBoundary>
  );
} 