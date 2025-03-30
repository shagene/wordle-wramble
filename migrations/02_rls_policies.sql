-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educator_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Word lists table policies
CREATE POLICY "Users can view their own word lists"
  ON public.word_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public word lists"
  ON public.word_lists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own word lists"
  ON public.word_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own word lists"
  ON public.word_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own word lists"
  ON public.word_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Progress table policies
CREATE POLICY "Users can view their own progress"
  ON public.progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Audio cache table policies
CREATE POLICY "Users can view audio cache"
  ON public.audio_cache FOR SELECT
  TO authenticated
  USING (true);

-- Usage tracking table policies
CREATE POLICY "Users can view their own usage tracking"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage tracking"
  ON public.usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Promotions table policies
CREATE POLICY "All users can view promotions"
  ON public.promotions FOR SELECT
  TO authenticated
  USING (true);

-- User promotions table policies
CREATE POLICY "Users can view their own promotions"
  ON public.user_promotions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own promotions"
  ON public.user_promotions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Educator verifications table policies
CREATE POLICY "Users can view their own verifications"
  ON public.educator_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications"
  ON public.educator_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Organization policies
CREATE POLICY "Organization members can view their organization"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = id AND user_id = auth.uid()
    )
  );

-- Organization members policies
CREATE POLICY "Organization members can view their member record"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = auth.uid() AND is_admin = true AND
      organization_id = organization_members.organization_id
    )
  );

-- Organization resources policies
CREATE POLICY "Organization members can view organization resources"
  ON public.organization_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organization_resources.organization_id AND user_id = auth.uid()
    )
  );

-- Subscription events policies
CREATE POLICY "Users can view their own subscription events"
  ON public.subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- Create roles and special permissions (admin role)
-- (This would typically be done through the Supabase dashboard for service roles) 