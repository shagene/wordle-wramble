// This is a server component to check environment variables
export default function ServerEnvCheck() {
  console.log('[ServerEnvCheck] Server Component Environment Check:');
  console.log('[ServerEnvCheck] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'undefined');
  console.log('[ServerEnvCheck] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'defined' : 'undefined');
  
  // Only used in server/build logs, component doesn't render anything
  return null;
} 