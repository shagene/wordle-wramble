'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getClientSupabase } from '../../lib/supabase';
import { Button } from '../../components/button';
import { Input, InputGroup } from '../../components/input';
import { Text } from '../../components/text';
import { Heading } from '../../components/heading';
import Link from 'next/link';

// Define form schema
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Form data type
type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  
  // Initialize form with react-hook-form and zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const supabase = getClientSupabase();
      if (!supabase) {
        setErrorMessage('Unable to connect to authentication service. Please try again later.');
        return;
      }
      
      // Sign up the user with Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: data.fullName,
          },
        },
      });
      
      if (signUpError) {
        setErrorMessage(signUpError.message);
        return;
      }
      
      // Show verification message
      setShowVerificationMessage(true);
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (showVerificationMessage) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative background elements - improved positioning */}
        <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="fixed top-1/4 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="fixed bottom-1/4 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="w-full max-w-md text-center z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
          <Heading level={2} className="text-2xl font-[family-name:var(--font-bubblegum-sans)] text-purple-600 dark:text-purple-400 mb-4">Check your email</Heading>
          <Text className="mb-6">
            We&apos;ve sent you a verification link. Please check your email and click the link to complete your registration.
          </Text>
          <Link 
            href="/auth/login" 
            className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-[family-name:var(--font-bubblegum-sans)] rounded-xl py-3 px-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 inline-block"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative background elements - improved positioning */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-1/4 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-1/4 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="w-full max-w-md z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
        <div className="mb-8 text-center">
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
          <h2 className="text-2xl font-[family-name:var(--font-bubblegum-sans)] text-purple-600 dark:text-purple-400">Create an Account</h2>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-[family-name:var(--font-bubblegum-sans)]">
              Full Name
            </label>
            <InputGroup>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                className="rounded-lg border-blue-100 focus:border-blue-300 shadow-sm"
                {...register('fullName')}
              />
            </InputGroup>
            {errors.fullName && (
              <Text className="mt-1 text-sm text-red-600">{errors.fullName.message}</Text>
            )}
          </div>
          
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
                autoComplete="new-password"
                className="rounded-lg border-blue-100 focus:border-blue-300 shadow-sm"
                {...register('password')}
              />
            </InputGroup>
            {errors.password && (
              <Text className="mt-1 text-sm text-red-600">{errors.password.message}</Text>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-[family-name:var(--font-bubblegum-sans)]">
              Confirm Password
            </label>
            <InputGroup>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="rounded-lg border-blue-100 focus:border-blue-300 shadow-sm"
                {...register('confirmPassword')}
              />
            </InputGroup>
            {errors.confirmPassword && (
              <Text className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</Text>
            )}
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
                  <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
                <span>{isLoading ? 'Creating account...' : 'Sign up'}</span>
              </div>
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Text className="text-sm">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
} 