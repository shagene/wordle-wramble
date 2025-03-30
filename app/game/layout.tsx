'use client';

import { ReactNode, useEffect } from 'react';
import { RouteGuard } from '@/app/providers/auth/RouteGuard';
import { GameProvider } from './context/GameContext';
import { ErrorBoundary } from '@/app/ui/errors/ErrorBoundary';
import { useAuth } from '@/app/hooks/useAuth';
import { getClientSupabase } from '@/app/lib/supabase';

export default function GameLayout({ children }: { children: ReactNode }) {
  // Include the useAuth hook to ensure it's mounted and authentication state is initialized
  const { user, session, isLoading } = useAuth();
  
  // Add debugging for auth state in game layout
  useEffect(() => {
    console.log('GameLayout: Mounted with auth state:', { 
      hasUser: !!user, 
      hasSession: !!session,
      isLoading
    });
    
    // Extra check - directly query Supabase session
    const checkSession = async () => {
      try {
        const supabase = getClientSupabase();
        if (!supabase) {
          console.error('GameLayout: Failed to connect to authentication service');
          return;
        }
        
        const { data } = await supabase.auth.getSession();
        console.log('GameLayout: Direct session check:', { 
          hasSession: !!data.session,
          userId: data.session?.user?.id 
        });
      } catch (err) {
        console.error('GameLayout: Session check error', err);
      }
    };
    
    checkSession();
  }, [user, session, isLoading]);

  return (
    <ErrorBoundary>
      <RouteGuard>
        <GameProvider>
          {children}
        </GameProvider>
      </RouteGuard>
    </ErrorBoundary>
  );
} 