// Environment variables accessible to client components
console.log('[env.ts] Initializing environment module');

// These are the hardcoded fallback values as a last resort
// Should match values in .env.local
const FALLBACKS = {
  SUPABASE_URL: 'https://gwvhbimnktyovdmdcdnm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dmhiaW1ua3R5b3ZkbWRjZG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTA0OTcsImV4cCI6MjA1ODE4NjQ5N30.AMUH2C4ESS6GohZ7X2Lzoj0X9OB2eaA-lO26dffEUxk',
  APP_URL: 'http://localhost:3000'
};

// Helper function to get env variables with fallbacks
const getEnv = (key: string, fallback: string = '') => {
  // Try to get from process.env
  const value = process.env[`NEXT_PUBLIC_${key}`] || '';
  
  // If empty, try fallback
  if (!value && FALLBACKS[key as keyof typeof FALLBACKS]) {
    console.warn(`[env.ts] Using fallback for ${key}`);
    return FALLBACKS[key as keyof typeof FALLBACKS];
  }
  
  return value || fallback;
};

// Only use NEXT_PUBLIC_ prefixed env vars here
export const env = {
  // Supabase
  SUPABASE_URL: getEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY'),
  
  // App
  APP_URL: getEnv('APP_URL', 'http://localhost:3000'),
  
  // ElevenLabs
  ELEVEN_LABS_API_KEY: getEnv('ELEVEN_LABS_API_KEY'),
  
  // Stripe
  STRIPE_PUBLISHABLE_KEY: getEnv('STRIPE_PUBLISHABLE_KEY'),
};

// Log env values to help with debugging
console.log('[env.ts] Environment loaded:');
console.log('[env.ts] SUPABASE_URL present:', !!env.SUPABASE_URL);
console.log('[env.ts] SUPABASE_ANON_KEY present:', !!env.SUPABASE_ANON_KEY);
console.log('[env.ts] APP_URL:', env.APP_URL);

// Export a function to explicitly check if all required vars are present
export const checkRequiredEnvVars = () => {
  const missingVars = [];
  
  if (!env.SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!env.SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (missingVars.length > 0) {
    console.error(`[env.ts] Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}; 