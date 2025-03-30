import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthLoading } from './AuthLoading';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Show loading state while checking auth
  if (isLoading) {
    return <AuthLoading />;
  }

  // If no user is found after loading, redirect to login
  if (!user) {
    router.push(`/auth/login?redirect=${window.location.pathname}`);
    return <AuthLoading />;
  }

  // If we have a user, render the protected content
  return <>{children}</>;
}

export default ProtectedRoute; 