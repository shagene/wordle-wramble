'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/button';
import { Input, InputGroup } from '../../components/input';
import { Text } from '../../components/text';
import { Heading } from '../../components/heading';

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
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <Heading level={1} className="font-[family-name:var(--font-bubblegum-sans)] text-5xl mb-6 text-blue-600 dark:text-blue-400">
            <span className="inline-block hover:animate-bounce transition-transform duration-300">W</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-100">o</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-150">r</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-200">d</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-250">l</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-300">e</span>
            <span className="mx-2"></span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-350">W</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-400">r</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-450">a</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-500">m</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-550">b</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-600">l</span>
            <span className="inline-block hover:animate-bounce transition-transform duration-300 delay-650">e</span>
          </Heading>
          <h2 className="text-2xl font-[family-name:var(--font-bubblegum-sans)] text-purple-600 dark:text-purple-400">Sign In</h2>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 animate-in fade-in">
            {errorMessage}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-[family-name:var(--font-bubblegum-sans)]">
                Email address
              </label>
              <InputGroup>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="rounded-lg border-blue-100 focus:border-blue-300 shadow-sm"
                  {...register('email')}
                />
              </InputGroup>
              {errors.email && (
                <Text className="mt-1 text-sm text-red-600">{errors.email.message}</Text>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-[family-name:var(--font-bubblegum-sans)]">
                Password
              </label>
              <InputGroup>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="rounded-lg border-blue-100 focus:border-blue-300 shadow-sm"
                  {...register('password')}
                />
              </InputGroup>
              {errors.password && (
                <Text className="mt-1 text-sm text-red-600">{errors.password.message}</Text>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Button plain href="/auth/reset-password" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Forgot your password?
                </Button>
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                disabled={isLoading}
                color="blue"
                className="w-full text-xl px-4 py-2 hover:scale-105 transition-transform duration-300 font-[family-name:var(--font-bubblegum-sans)]"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                  <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                </div>
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Text className="text-sm">
              Don&apos;t have an account?{' '}
              <Button plain href="/auth/signup" className="inline-flex items-center gap-1 font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                Sign up
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
              </Button>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the suspense-wrapped component
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-bounce text-3xl font-[family-name:var(--font-bubblegum-sans)] text-blue-500">Loading...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
} 