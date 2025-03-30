import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// This middleware will run on all matching routes
export async function middleware(request: NextRequest) {
  // Initialize response
  const response = NextResponse.next();
  
  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          try {
            const cookie = request.cookies.get(name);
            if (!cookie) return null;
            return cookie.value;
          } catch (error) {
            console.error(`Error getting cookie ${name}:`, error);
            return null;
          }
        },
        set(name, value, options) {
          try {
            // If the cookie is updated, update the response as well
            response.cookies.set({
              name,
              value,
              ...options,
            });
          } catch (error) {
            console.error(`Error setting cookie ${name}:`, error);
          }
        },
        remove(name, options) {
          try {
            // If the cookie is removed, update the response as well
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          } catch (error) {
            console.error(`Error removing cookie ${name}:`, error);
          }
        },
      },
    }
  );

  try {
    // Refresh the session
    const { data: { session } } = await supabase.auth.getSession();

    // Authentication handling
    const path = request.nextUrl.pathname;
    
    // Public paths that don't require auth
    const isPublicPath = [
      '/',
      '/auth/login',
      '/auth/signup',
      '/auth/reset-password',
      '/auth/callback',
    ].includes(path) || path.startsWith('/_next') || path.startsWith('/api');
    
    // Auth paths that should redirect logged-in users
    const isAuthPath = [
      '/auth/login',
      '/auth/signup',
      '/auth/reset-password',
    ].includes(path);
    
    // Protected paths that require auth
    const isProtectedPath = path.startsWith('/game') || 
                            path.startsWith('/wordlist') || 
                            path.startsWith('/account');

    // If user is logged in and tries to access auth paths, redirect to home
    if (session && isAuthPath) {
      console.log('Middleware: User is logged in, redirecting from auth page to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If user is not logged in and tries to access protected paths, redirect to login
    if (!session && isProtectedPath) {
      console.log('Middleware: User is not logged in, redirecting to login');
      const redirectUrl = encodeURIComponent(path);
      return NextResponse.redirect(new URL(`/auth/login?redirect=${redirectUrl}`, request.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static files, api routes, and Next.js specific paths
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 