// Define subscription tier types
export type SubscriptionTier = 'free' | 'basic' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled';

// Define error types
export type DatabaseError = {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
};

export type ServiceError = string | Error | DatabaseError;

// Define the user profile interface
export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id?: string | null;
  subscription_id?: string | null;
  is_educator: boolean;
  trial_start_date?: string | null;
  trial_end_date?: string | null;
  has_used_trial: boolean;
  organization_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Define the word list interface
export interface WordList {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  is_public: boolean;
  words: string[];
  hints?: string[] | null;
  created_at: string;
  updated_at: string;
}

// Define the progress interface
export interface Progress {
  id: string;
  user_id: string;
  word_list_id: string;
  word_index: number;
  attempts: number;
  completed: boolean;
  stars: number;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Define the audio cache interface
export interface AudioCache {
  id: string;
  text: string;
  text_hash: string;
  voice_id: string;
  file_path: string;
  file_size: number;
  access_count: number;
  last_accessed: string;
  created_at: string;
}

// Define the usage tracking interface
export interface UsageTracking {
  id: string;
  user_id: string;
  feature: string;
  count: number;
  reset_at: string;
  created_at: string;
  updated_at: string;
}

// Define the promotion interface
export interface Promotion {
  id: string;
  name: string;
  type: string;
  value?: number | null;
  code?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  max_uses?: number | null;
  current_uses: number;
  applies_to_tiers: SubscriptionTier[];
  created_at: string;
  updated_at: string;
}

// Define the user promotion interface
export interface UserPromotion {
  id: string;
  user_id: string;
  promotion_id: string;
  claimed_at: string;
  applied_at?: string | null;
  created_at: string;
}

// Define educator verification interface
export interface EducatorVerification {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  verification_method: 'email' | 'document';
  proof_url?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Define organization interface
export interface Organization {
  id: string;
  name: string;
  contact_email: string;
  contact_name?: string | null;
  subscription_id?: string | null;
  stripe_customer_id?: string | null;
  max_seats: number;
  active_seats: number;
  billing_frequency: 'monthly' | 'annually';
  custom_price_per_seat?: number | null;
  created_at: string;
  updated_at: string;
}

// Define organization member interface
export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'member' | 'admin';
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Define organization resource interface
export interface OrganizationResource {
  id: string;
  organization_id: string;
  resource_type: 'word_list' | 'audio';
  resource_id: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Define subscription event interface
export interface SubscriptionEvent {
  id: string;
  userId: string;
  eventType: string;
  oldTier?: string;
  newTier?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Define feature limitations by subscription tier
export const SUBSCRIPTION_LIMITS = {
  free: {
    wordListsLimit: 2,
    wordsPerListLimit: 5,
    voiceSelectionCount: 2,
    dailyAudioGenerations: 10,
    audioQuality: 'standard',
  },
  basic: {
    wordListsLimit: 10,
    wordsPerListLimit: 30,
    voiceSelectionCount: 5,
    dailyAudioGenerations: 50,
    audioQuality: 'enhanced',
  },
  premium: {
    wordListsLimit: Infinity,
    wordsPerListLimit: Infinity,
    voiceSelectionCount: Infinity,
    dailyAudioGenerations: Infinity,
    audioQuality: 'highest',
  }
};

// Define subscription pricing
export const SUBSCRIPTION_PRICING = {
  basic: {
    standard: {
      monthly: 3.99,
      annually: 39.99
    },
    educator: {
      monthly: 1.99,
      annually: 19.99
    }
  },
  premium: {
    standard: {
      monthly: 7.99,
      annually: 79.99
    },
    educator: {
      monthly: 3.99,
      annually: 39.99
    }
  }
}; 