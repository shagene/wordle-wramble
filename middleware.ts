import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// This middleware will run on all matching routes
export async function middleware(request: NextRequest) {
  console.log('Middleware running on path:', request.nextUrl.pathname);
  
  // Try to extract the domain or projectRef for cookie name prefix
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '';
  console.log('Middleware projectRef:', projectRef);
  
  // Get all cookies for debugging
  const allCookies = request.cookies.getAll();
  console.log('Middleware cookies count:', allCookies.length);
  console.log('Middleware cookies:', allCookies.map(c => `${c.name}: ${c.value ? `present (${c.value.length})` : 'empty'}`));
  
  // Document cookie patterns related to Supabase auth
  const authCookiePatterns = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'sb-auth-token',
    'sb-provider-token',
    'sb-provider-refresh-token',
    'sb-gwvhbimnktyovdmdcdnm-auth-token',
    ...(projectRef ? [
      `sb-${projectRef}-auth-token`, 
      `sb-${projectRef}-auth-token.0`,
      `sb-${projectRef}-auth-token.1`,
      `sb-${projectRef}-auth-token.2`
    ] : [])
  ];
  
  console.log('Looking for auth cookie patterns:', authCookiePatterns);
  
  const foundAuthCookies = allCookies.filter(c => 
    authCookiePatterns.some(pattern => c.name.includes(pattern))
  );
  
  console.log('Found auth-related cookies:', 
    foundAuthCookies.length 
      ? foundAuthCookies.map(c => `${c.name}: length=${c.value.length}`) 
      : 'None'
  );
  
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
            // Standard cookie lookup in request
            const cookie = request.cookies.get(name);
            
            if (!cookie) {
              console.log(`Middleware: Cookie '${name}' not found`);
              
              // If this is the auth token, try some alternative cookie names
              if (name.includes('auth-token')) {
                for (const pattern of authCookiePatterns) {
                  const altCookie = request.cookies.get(pattern);
                  if (altCookie) {
                    console.log(`Middleware: Found alternative cookie '${pattern}' instead of '${name}'`);
                    return altCookie.value;
                  }
                }
                
                // Last attempt: Parse the cookie header directly
                const cookieHeader = request.headers.get('cookie');
                if (cookieHeader) {
                  for (const pattern of authCookiePatterns) {
                    const match = new RegExp(`${pattern}=([^;]+)`).exec(cookieHeader);
                    if (match) {
                      console.log(`Middleware: Found '${pattern}' in cookie header`);
                      return match[1];
                    }
                  }
                }
              }
              
              return null;
            }
            
            console.log(`Middleware: Cookie '${name}' found with length ${cookie.value.length}`);
            return cookie.value;
          } catch (error) {
            console.error(`Error getting cookie ${name}:`, error);
            return null;
          }
        },
        set(name, value, options) {
          try {
            console.log(`Middleware: Setting cookie '${name}' with length ${value?.length || 0}`);
            // If the cookie is updated, update the response as well
            response.cookies.set({
              name,
              value,
              ...options,
              // Ensure cookies are properly set
              path: options?.path || '/',
              sameSite: options?.sameSite || 'lax'
            });
          } catch (error) {
            console.error(`Error setting cookie ${name}:`, error);
          }
        },
        remove(name, options) {
          try {
            console.log(`Middleware: Removing cookie '${name}'`);
            // If the cookie is removed, update the response as well
            response.cookies.set({
              name,
              value: '',
              ...options,
              path: '/',
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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Middleware session error:', sessionError);
    }
    
    if (session) {
      console.log('Middleware session check: User authenticated (ID:', session.user.id, ')');
    } else {
      console.log('Middleware session check: No session found');
    }

    // Authentication handling
    const path = request.nextUrl.pathname;
    
    // Public paths that don't require auth
    const isPublicPath = [
      '/',
      '/auth/login',
      '/auth/signup',
      '/auth/reset-password',
      '/auth/callback',
      '/auth/sync-cookies',
      '/test',
      '/debug',
      '/debug/supabase'
    ].includes(path) || path.startsWith('/_next') || path.startsWith('/api') || path.endsWith('.ico');
    
    // Auth paths that should redirect logged-in users
    const isAuthPath = [
      '/auth/login',
      '/auth/signup',
      '/auth/reset-password',
    ].includes(path);
    
    // Protected paths that require auth
    const isProtectedPath = path.startsWith('/game') || 
                            path.startsWith('/wordlist') || 
                            path.startsWith('/account') ||
                            path.startsWith('/progress') ||
                            path.startsWith('/share');

    console.log('Path classification:', { 
      path, 
      isPublicPath, 
      isAuthPath, 
      isProtectedPath 
    });

    // Check for special logout flow flag in the URL
    const isLoggingOut = request.nextUrl.searchParams.has('logging_out');
    if (isLoggingOut) {
      console.log('Middleware: User is logging out, allowing navigation.');
      return NextResponse.next();
    }

    // If user is logged in and tries to access auth paths, redirect to home
    if (session && isAuthPath) {
      console.log('Middleware: User is logged in, redirecting from auth page to home');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If user is not logged in and tries to access protected paths, redirect to login
    if (!session && isProtectedPath) {
      console.log('Middleware: User is not logged in, redirecting to login');
      
      // Use searchParams.set for cleaner URL handling
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      
      console.log('Redirecting to:', loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }
    
    // If we get here, allow the request to proceed
    console.log('Middleware: Request allowed to proceed');
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, allow access to public routes but redirect protected routes to login
    const path = request.nextUrl.pathname;
    const isProtectedPath = path.startsWith('/game') || 
                            path.startsWith('/wordlist') || 
                            path.startsWith('/account') ||
                            path.startsWith('/progress') ||
                            path.startsWith('/share');
                            
    if (isProtectedPath) {
      console.log('Middleware: Error occurred on protected path, redirecting to login');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
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