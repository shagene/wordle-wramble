import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function initializeStorageBuckets() {
  console.log('Starting Supabase storage buckets initialization...');

  try {
    console.log('Creating storage buckets...');
    
    // Create audio-cache bucket
    const { error: audioBucketError } = await supabase.storage.createBucket('audio-cache', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['audio/mpeg', 'audio/mp3']
    });
    
    if (audioBucketError && audioBucketError.message !== 'Bucket already exists') {
      console.error('Error creating audio-cache bucket:', audioBucketError);
    } else {
      console.log('Audio cache bucket created or already exists.');
    }
    
    // Create user-uploads bucket
    const { error: uploadsBucketError } = await supabase.storage.createBucket('user-uploads', {
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
    });
    
    if (uploadsBucketError && uploadsBucketError.message !== 'Bucket already exists') {
      console.error('Error creating user-uploads bucket:', uploadsBucketError);
    } else {
      console.log('User uploads bucket created or already exists.');
    }

    console.log('Storage buckets initialized successfully!');
    console.log('\nIMPORTANT: You still need to manually run the SQL scripts in the Supabase dashboard:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to "SQL Editor" in the left sidebar');
    console.log('3. Open and run the file migrations/01_initial_schema.sql');
    console.log('4. Open and run the file migrations/02_rls_policies.sql');
  } catch (error: any) {
    console.error('Error during initialization:', error.message);
    process.exit(1);
  }
}

// Run the initialization
initializeStorageBuckets(); 