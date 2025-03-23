# Wordle Wramble: Migration & Monetization Plan

## Project Overview

Wordle Wramble is currently a client-side application that uses localStorage for data persistence. This migration plan outlines the process of transforming it into a freemium subscription-based application using Supabase for backend services and Stripe for payment processing.

## Goals

1. Implement user authentication and accounts
2. Migrate from localStorage to Supabase database
3. Create a tiered subscription model using Stripe
4. Optimize ElevenLabs API usage based on subscription levels
5. Enhance the user experience with premium features

## Technical Stack

- **Frontend**: Next.js with App Router, Tailwind CSS + Catalyst UI
- **Backend**: Supabase (Auth, Database, Storage)
- **API**: Vercel AI SDK for ElevenLabs integration
- **Data Fetching**: Tanstack Query
- **Forms**: React Hook Form + Zod
- **Payments**: Stripe integration with Supabase

## Migration Plan

### Phase 1: Setup & Infrastructure (Week 1)

1. **Supabase Setup**
   - Create Supabase project
   - Define database schema
   - Configure authentication providers
   - Set up storage buckets for audio caching

2. **Environment Configuration**
   - Update environment variables
   - Create configuration files for different environments

3. **Project Structure Reorganization**
   - Implement feature-based folder structure
   - Create shared types directory
   - Set up middleware for protected routes

### Phase 2: Authentication & User Management (Week 2)

1. **Auth Components**
   - Create signup/login pages
   - Implement email verification
   - Add password reset functionality
   - Build user profile management

2. **Data Migration Utility**
   - Create tool to migrate localStorage data to Supabase
   - Implement data format conversion
   - Test migration with sample data

3. **User-Specific Data Management**
   - Update wordlist storage logic
   - Modify progress tracking
   - Implement user settings

### Phase 3: Subscription System (Week 3)

1. **Stripe Integration**
   - Set up Stripe account and products
   - Create subscription plans
   - Implement webhook handling
   - Build checkout process

2. **Subscription UI**
   - Design pricing page
   - Create subscription management interface
   - Implement upgrade/downgrade flows
   - Add payment method management

3. **Feature Gating**
   - Create middleware for subscription checks
   - Implement feature availability based on subscription tier
   - Build fallback experiences for free users

### Phase 4: Premium Features & ElevenLabs Optimization (Week 4)

1. **Voice Management**
   - Implement voice selection based on subscription tier
   - Create limits for free tier usage
   - Add voice favorites for premium users

2. **Audio Caching**
   - Store common audio responses in Supabase storage
   - Implement cache invalidation strategy
   - Add audio quality options for different tiers

3. **Enhanced Analytics**
   - Track user engagement metrics
   - Monitor conversion rates
   - Analyze feature usage patterns

## Subscription Tiers

### Free Tier
- 5 words per list
- 2 word lists maximum
- Basic voice selection (2 voices)
- Limited daily audio generations (10 per day)
- Standard-quality audio

### Basic Tier ($3.99/month)
- 30 words per list
- 10 word lists maximum
- Extended voice selection (5 voices)
- Increased audio generations (50 per day)
- Enhanced audio quality
- No ads

### Premium Tier ($7.99/month)
- Unlimited words per list
- Unlimited word lists
- All available voices
- Unlimited audio generations
- Highest audio quality
- Priority processing
- Advanced progress analytics
- Export/import functionality

## Database Schema

### Users Table
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free' not null,
  subscription_status text default 'active' not null,
  stripe_customer_id text,
  subscription_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
```

### Word Lists Table
```sql
create table public.word_lists (
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
```

### Progress Table
```sql
create table public.progress (
  id uuid default uuid_generate_v4() not null primary key,
  user_id uuid references public.profiles not null,
  word_list_id uuid references public.word_lists not null,
  word_index integer not null,
  attempts integer default 0 not null,
  completed boolean default false not null,
  stars integer default 0 not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(user_id, word_list_id, word_index)
);
```

### Audio Cache Table
```sql
create table public.audio_cache (
  id uuid default uuid_generate_v4() not null primary key,
  text text not null,
  voice_id text not null,
  file_path text not null,
  created_at timestamp with time zone default now() not null,
  unique(text, voice_id)
);
```

## Testing Strategy

1. **Unit Tests**
   - Test core business logic
   - Validate subscription feature gating
   - Ensure proper data migration

2. **Integration Tests**
   - Test Supabase data operations
   - Verify Stripe integration
   - Validate ElevenLabs API optimization

3. **E2E Tests**
   - Test complete user journeys
   - Verify subscription flows
   - Validate cross-device functionality

## Analytics Implementation

1. Track key metrics:
   - Conversion rate (free to paid)
   - Feature usage by subscription tier
   - User retention and engagement
   - Voice usage patterns

2. Implement event tracking for:
   - Game completions
   - ElevenLabs API calls
   - Subscription changes
   - Feature usage

## Deployment Plan

1. **Development Environment**
   - Set up local development with Supabase emulator
   - Configure Stripe test mode

2. **Staging Environment**
   - Deploy to Vercel preview environment
   - Use separate Supabase instance
   - Test with Stripe test mode

3. **Production Deployment**
   - Phased rollout strategy
   - Database migration approach
   - Monitoring and alerting setup

## Next Steps

1. Set up Supabase project and create database schema
2. Implement authentication components and flows
3. Create migration utility for localStorage data
4. Set up Stripe integration for subscription management 