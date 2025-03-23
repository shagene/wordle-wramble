import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// This route handles callbacks from Supabase Auth (email verification, password reset, etc.)
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  
  if (code) {
    // Create a Supabase client for server-side operations using auth-helpers-nextjs
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    try {
      await supabase.auth.exchangeCodeForSession(code);
      
      // Check if the session was created successfully
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Failed to establish session after code exchange');
        // Redirect to login with an error
        return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url));
      }
      
      // Redirect to the app after the session has been set successfully
      return NextResponse.redirect(new URL(next, request.url));
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth/login?error=verification_error', request.url));
    }
  }
  
  // If no code is provided, redirect to the homepage
  return NextResponse.redirect(new URL('/', request.url));
} 