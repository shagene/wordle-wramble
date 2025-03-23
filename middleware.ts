import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// This middleware will run on all matching routes
export async function middleware(request: NextRequest) {
  // Create a response to modify
  let response = NextResponse.next();
  
  // Create a Supabase client configured for middleware
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the current pathname
  const { pathname } = request.nextUrl;
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/reset-password', '/auth/callback', '/test-supabase'];
  const isPublicRoute = publicRoutes.includes(pathname) || 
                         pathname.startsWith('/_next') || 
                         pathname.startsWith('/api/');
  
  // Define subscription-only routes
  const subscriptionRoutes = [
    '/game/premium',        // Premium game features
    '/account/subscription', // Subscription management
    '/voices/premium',       // Premium voice selection
  ];
  const isSubscriptionRoute = subscriptionRoutes.some(route => pathname.startsWith(route));
  
  // Redirect logic based on authentication and route type
  if (!session && !isPublicRoute) {
    // If trying to access a protected route without a session, redirect to login
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If the user is trying to access subscription-only route, check their subscription
  if (session && isSubscriptionRoute) {
    // Fetch user profile to check subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', session.user.id)
      .single();
    
    // If the user doesn't have an active paid subscription, redirect to upgrade page
    if (!profile || 
        profile.subscription_tier === 'free' || 
        profile.subscription_status !== 'active') {
      return NextResponse.redirect(new URL('/account/upgrade', request.url));
    }
  }
  
  // Continue with the modified response
  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Routes that require protection:
    '/game/:path*',    // Game routes
    '/wordlist/:path*', // Word list management
    '/account/:path*',  // Account settings
    '/voices/:path*',   // Voice selection
    '/progress/:path*', // Progress tracking
    
    // Auth routes for handling callbacks
    '/auth/:path*',
    
    // Test routes
    '/test-supabase',
    
    // Exclude static files, images, and API routes that don't need auth checking
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
  ],
}; 