import { supabase, supabaseAdmin } from './supabase';

// Define bucket names
export const STORAGE_BUCKETS = {
  AUDIO_CACHE: 'audio-cache',
  USER_UPLOADS: 'user-uploads'
};

/**
 * Initialize storage buckets if they don't exist
 * This should be called during app initialization or from an admin function
 */
export const initializeStorageBuckets = async () => {
  try {
    // Check and create audio-cache bucket
    const { data: audioBuckets } = await supabaseAdmin.storage.getBucket(STORAGE_BUCKETS.AUDIO_CACHE);
    if (!audioBuckets) {
      await supabaseAdmin.storage.createBucket(STORAGE_BUCKETS.AUDIO_CACHE, {
        public: true, // Public access for cached audio
        fileSizeLimit: 10485760, // 10MB max file size
        allowedMimeTypes: ['audio/mpeg', 'audio/mp3']
      });
      
      // CORS configuration would be set in the Supabase Dashboard
      // or via the Admin API - this can't be done directly in the JS client
    }
    
    // Check and create user-uploads bucket (for educator verification, etc.)
    const { data: uploadBuckets } = await supabaseAdmin.storage.getBucket(STORAGE_BUCKETS.USER_UPLOADS);
    if (!uploadBuckets) {
      await supabaseAdmin.storage.createBucket(STORAGE_BUCKETS.USER_UPLOADS, {
        public: false, // Private by default
        fileSizeLimit: 5242880, // 5MB max file size
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
    return { success: false, error };
  }
};

/**
 * Upload a file to a storage bucket
 */
export const uploadFile = async (
  bucketName: string,
  filePath: string,
  fileData: File | Blob | ArrayBuffer,
  options?: { contentType?: string; cacheControl?: string }
) => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileData, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl || '3600',
        upsert: true
      });
      
    if (error) throw error;
    
    return { success: true, filePath };
  } catch (error) {
    console.error(`Error uploading file to ${bucketName}:`, error);
    return { success: false, error };
  }
};

/**
 * Get a public URL for a file in a storage bucket
 */
export const getPublicUrl = (bucketName: string, filePath: string) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (bucketName: string, filePath: string) => {
  try {
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error deleting file from ${bucketName}:`, error);
    return { success: false, error };
  }
};

/**
 * Generate a signed URL for temporary access to a private file
 */
export const getSignedUrl = async (bucketName: string, filePath: string, expiresIn = 60) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);
      
    if (error) throw error;
    
    return { success: true, signedUrl: data.signedUrl };
  } catch (error) {
    console.error(`Error generating signed URL for ${bucketName}/${filePath}:`, error);
    return { success: false, error };
  }
}; 