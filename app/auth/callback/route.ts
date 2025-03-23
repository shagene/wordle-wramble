import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// This route handles callbacks from Supabase Auth (email verification, password reset, etc.)
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  
  // Prepare response for cookie manipulation
  const response = NextResponse.redirect(new URL(next, request.url));
  
  if (code) {
    try {
      // Create a Supabase client for server-side operations using ssr package
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name) => request.cookies.get(name)?.value,
            set: (name, value, options) => {
              response.cookies.set({ name, value, ...options });
            },
            remove: (name, options) => {
              response.cookies.set({ name, value: '', ...options, maxAge: 0 });
            },
          },
        }
      );
      
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
      
      // Check if the session was created successfully
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Failed to establish session after code exchange');
        // Redirect to login with an error
        return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url));
      }
      
      // Use the response with cookies already set
      return response;
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth/login?error=verification_error', request.url));
    }
  }
  
  // If no code is provided, redirect to the homepage
  return NextResponse.redirect(new URL('/', request.url));
} 