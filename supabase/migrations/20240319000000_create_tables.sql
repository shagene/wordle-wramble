-- Create setup_logs table
CREATE TABLE IF NOT EXISTS public.setup_logs (
  id uuid default uuid_generate_v4() not null primary key,
  ip_address text not null,
  success boolean not null,
  error_message text,
  created_at timestamp with time zone default now() not null
);

ALTER TABLE public.setup_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage setup logs" ON public.setup_logs;
CREATE POLICY "Service role can manage setup logs"
  ON public.setup_logs
  USING (auth.jwt()->>'role' = 'service_role');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free' not null,
  subscription_status text default 'active' not null,
  stripe_customer_id text,
  subscription_id text,
  is_educator boolean default false,
  trial_start_date timestamp with time zone,
  trial_end_date timestamp with time zone,
  has_used_trial boolean default false,
  organization_id uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);
  
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
  
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create word_lists table
CREATE TABLE IF NOT EXISTS public.word_lists (
  id uuid default uuid_generate_v4() not null primary key,
  user_id uuid references public.profiles not null,
  name text not null,
  description text,
  is_public boolean default false not null,
  words text[] not null,
  hints text[],
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

ALTER TABLE public.word_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own word lists" ON public.word_lists;
CREATE POLICY "Users can view their own word lists"
  ON public.word_lists
  FOR SELECT
  USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can view public word lists" ON public.word_lists;
CREATE POLICY "Users can view public word lists"
  ON public.word_lists
  FOR SELECT
  USING (is_public = true);
  
DROP POLICY IF EXISTS "Users can update their own word lists" ON public.word_lists;
CREATE POLICY "Users can update their own word lists"
  ON public.word_lists
  FOR UPDATE
  USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can delete their own word lists" ON public.word_lists;
CREATE POLICY "Users can delete their own word lists"
  ON public.word_lists
  FOR DELETE
  USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can insert their own word lists" ON public.word_lists;
CREATE POLICY "Users can insert their own word lists"
  ON public.word_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id); 