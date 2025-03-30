import type { NextConfig } from "next";

// Log environment variable availability during build/config initialization
console.log('========================================');
console.log('Next.js Config - Environment Variables Check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing');
console.log('========================================');

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Explicitly define all client-side environment variables
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_ELEVEN_LABS_API_KEY: process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  // Make sure environment variables are statically analyzed
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
