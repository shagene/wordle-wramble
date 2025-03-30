-- Create the profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' NOT NULL,
  subscription_status TEXT DEFAULT 'active' NOT NULL,
  stripe_customer_id TEXT,
  subscription_id TEXT,
  is_educator BOOLEAN DEFAULT FALSE,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  has_used_trial BOOLEAN DEFAULT FALSE,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the word_lists table
CREATE TABLE public.word_lists (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  words TEXT[] NOT NULL,
  hints TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the progress table
CREATE TABLE public.progress (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles NOT NULL,
  word_list_id UUID REFERENCES public.word_lists NOT NULL,
  word_index INTEGER NOT NULL,
  attempts INTEGER DEFAULT 0 NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  stars INTEGER DEFAULT 0 NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, word_list_id, word_index)
);

-- Create the audio_cache table
CREATE TABLE public.audio_cache (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  text TEXT NOT NULL,
  text_hash TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  access_count INTEGER DEFAULT 0 NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(text_hash, voice_id)
);

-- Create the usage_tracking table
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles NOT NULL,
  feature TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 day') NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, feature)
);

-- Create the promotions table
CREATE TABLE public.promotions (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value NUMERIC,
  code TEXT UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  applies_to_tiers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the user_promotions table
CREATE TABLE public.user_promotions (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles NOT NULL,
  promotion_id UUID REFERENCES public.promotions NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the educator_verifications table
CREATE TABLE public.educator_verifications (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  verification_method TEXT NOT NULL,
  proof_url TEXT,
  reviewed_by UUID REFERENCES public.profiles,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the organizations table
CREATE TABLE public.organizations (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT,
  subscription_id TEXT,
  stripe_customer_id TEXT,
  max_seats INTEGER NOT NULL,
  active_seats INTEGER DEFAULT 0,
  billing_frequency TEXT DEFAULT 'monthly',
  custom_price_per_seat NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the organization_members table
CREATE TABLE public.organization_members (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations NOT NULL,
  user_id UUID REFERENCES public.profiles NOT NULL,
  role TEXT DEFAULT 'member' NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(organization_id, user_id)
);

-- Create the organization_resources table
CREATE TABLE public.organization_resources (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  created_by UUID REFERENCES public.profiles,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create the subscription_events table
CREATE TABLE public.subscription_events (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles NOT NULL,
  event_type TEXT NOT NULL,
  old_tier TEXT,
  new_tier TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key reference in profiles to organizations
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_organization 
FOREIGN KEY (organization_id) 
REFERENCES public.organizations(id);

-- Create indexes for frequently accessed fields
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX idx_word_lists_user_id ON public.word_lists(user_id);
CREATE INDEX idx_word_lists_is_public ON public.word_lists(is_public);
CREATE INDEX idx_progress_user_id ON public.progress(user_id);
CREATE INDEX idx_progress_word_list_id ON public.progress(word_list_id);
CREATE INDEX idx_audio_cache_text_hash_voice_id ON public.audio_cache(text_hash, voice_id);
CREATE INDEX idx_usage_tracking_user_id_feature ON public.usage_tracking(user_id, feature);
CREATE INDEX idx_organization_members_user_id ON public.organization_members(user_id); 