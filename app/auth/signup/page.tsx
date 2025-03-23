'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/button';
import { Input, InputGroup } from '../../components/input';
import { Text } from '../../components/text';

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
      
      // 1. Sign up the user with Supabase Auth
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
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
      
      // 2. Create a profile in the profiles table
      if (signUpData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: signUpData.user.id,
              email: data.email,
              full_name: data.fullName,
              subscription_tier: 'free',
              subscription_status: 'active',
            },
          ]);
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Continue anyway since the auth user was created
        }
      }
      
      // Show verification message instead of redirecting
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
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Check your email</h2>
          <Text className="mb-6">
            We&apos;ve sent you a verification link. Please check your email and click the link to complete your registration.
          </Text>
          <Button href="/auth/login" color="amber">
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-amber-600 mb-2">Wordle Wramble</h1>
          <h2 className="text-2xl font-semibold">Create an Account</h2>
          <Text className="mt-2">
            Join Wordle Wramble to save your progress and access premium features.
          </Text>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <InputGroup>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                {...register('fullName')}
              />
            </InputGroup>
            {errors.fullName && (
              <Text className="mt-1 text-sm text-red-600">{errors.fullName.message}</Text>
            )}
          </div>
          
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
                autoComplete="new-password"
                {...register('password')}
              />
            </InputGroup>
            {errors.password && (
              <Text className="mt-1 text-sm text-red-600">{errors.password.message}</Text>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <InputGroup>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
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
              color="amber"
              className="w-full"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Text className="text-sm">
            Already have an account?{' '}
            <Button plain href="/auth/login" className="font-medium">
              Sign in
            </Button>
          </Text>
        </div>
      </div>
    </div>
  );
} 