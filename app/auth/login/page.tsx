'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/button';
import { Input, InputGroup } from '../../components/input';
import { Text } from '../../components/text';

// Define form schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Form data type
type LoginFormValues = z.infer<typeof loginSchema>;

// Error message mapping
const errorMessages = {
  verification_failed: 'Email verification failed. Please try signing in again or contact support.',
  verification_error: 'There was a problem with your email verification. Please try again.',
  // Add more error messages as needed
};

// Wrapper component to handle suspense
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const errorCode = searchParams.get('error');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Handle error from URL if present
    if (errorCode && errorMessages[errorCode as keyof typeof errorMessages]) {
      setErrorMessage(errorMessages[errorCode as keyof typeof errorMessages]);
    }
  }, [errorCode]);
  
  // Initialize form with react-hook-form and zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Attempt to sign in
      const { error, data: authData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        console.error('Login error:', error);
        setErrorMessage(error.message);
        return;
      }
      
      if (!authData.session) {
        console.error('No session returned from login');
        setErrorMessage('Failed to create session. Please try again.');
        return;
      }
      
      // Double-check that we have a session after login
      const { data: sessionCheck } = await supabase.auth.getSession();
      
      if (!sessionCheck.session) {
        console.error('Session check failed after login');
        setErrorMessage('Session validation failed. Please try again or clear your cookies.');
        return;
      }
      
      console.log('Login successful, redirecting to', redirectTo);
      
      // Successful login, redirect after a short delay to ensure session is stored
      setTimeout(() => {
        router.push(redirectTo);
      }, 500);
      
    } catch (error) {
      console.error('Unexpected login error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-amber-600 mb-2">Wordle Wramble</h1>
          <h2 className="text-2xl font-semibold">Sign In</h2>
          <Text className="mt-2">
            Sign in to your account to track your progress and access premium features.
          </Text>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <InputGroup>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
              />
            </InputGroup>
            {errors.email && (
              <Text className="mt-1 text-sm text-red-600">{errors.email.message}</Text>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <InputGroup>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
            </InputGroup>
            {errors.password && (
              <Text className="mt-1 text-sm text-red-600">{errors.password.message}</Text>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Button plain href="/auth/reset-password">
                Forgot your password?
              </Button>
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              disabled={isLoading}
              color="amber"
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Text className="text-sm">
            Don&apos;t have an account?{' '}
            <Button plain href="/auth/signup" className="font-medium">
              Sign up
            </Button>
          </Text>
        </div>
      </div>
    </div>
  );
}

// Export the suspense-wrapped component
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
} 