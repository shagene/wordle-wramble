import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cache for rate limiting
const setupAttempts = new Map<string, { count: number; timestamp: number }>();

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : '127.0.0.1';
}

/**
 * Check if IP is in allowed list
 */
function isIPAllowed(ip: string): boolean {
  const allowedIPs = process.env.SETUP_ALLOWED_IPS?.split(',') || [];
  return allowedIPs.includes(ip);
}

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const hourAgo = now - 3600000; // 1 hour in milliseconds
  const rateLimit = parseInt(process.env.SETUP_RATE_LIMIT || '3', 10);
  
  // Clean up old entries
  for (const [key, value] of setupAttempts.entries()) {
    if (value.timestamp < hourAgo) {
      setupAttempts.delete(key);
    }
  }
  
  // Check current IP's attempts
  const attempts = setupAttempts.get(ip);
  if (!attempts) {
    setupAttempts.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (attempts.timestamp < hourAgo) {
    // Reset if last attempt was more than an hour ago
    setupAttempts.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (attempts.count >= rateLimit) {
    return false;
  }
  
  // Increment attempt count
  attempts.count += 1;
  attempts.timestamp = now;
  setupAttempts.set(ip, attempts);
  return true;
}

/**
 * Log setup attempt
 */
async function logSetupAttempt(ip: string, success: boolean, error?: string) {
  // Use a temporary server client for logging
  // Note: This uses the ANON key. If RLS prevents logging,
  // a dedicated service role client might be needed here.
  const cookieStore = await cookies(); // Await the cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    const { error: logError } = await supabase
      .from('setup_logs')
      .insert({
        ip_address: ip,
        success,
        error_message: error,
      });
      
    if (logError) {
      console.error('Failed to log setup attempt (Supabase Error):', logError);
    }
  } catch (catchError) {
    console.error('Failed to log setup attempt (Catch Error):', catchError);
  }
}

/**
 * Middleware for setup endpoint security
 */
export async function setupMiddleware(request: NextRequest) {
  // Check if setup is enabled
  if (process.env.SETUP_ENABLED !== 'true') {
    await logSetupAttempt(getClientIP(request), false, 'Setup endpoint is disabled');
    return NextResponse.json(
      { error: 'Setup endpoint is disabled' },
      { status: 403 }
    );
  }

  // Get and validate client IP
  const clientIP = getClientIP(request);
  if (!isIPAllowed(clientIP)) {
    await logSetupAttempt(clientIP, false, 'IP not allowed');
    return NextResponse.json(
      { error: 'Unauthorized IP address' },
      { status: 403 }
    );
  }

  // Check rate limit
  if (!checkRateLimit(clientIP)) {
    await logSetupAttempt(clientIP, false, 'Rate limit exceeded');
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  // Validate setup key
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key || key !== process.env.SETUP_SECRET_KEY) {
    await logSetupAttempt(clientIP, false, 'Invalid setup key');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // If all checks pass, allow the request
  return NextResponse.next();
} 