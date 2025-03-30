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

## Progress Report

### Completed Tasks

1. **Supabase Setup (Phase 1)**
   - ✅ Created Supabase project
   - ✅ Defined database schema
   - ✅ Configured authentication providers
   - ✅ Set up storage buckets for audio caching

2. **Authentication System (Phase 2)**
   - ✅ Implemented signup/login pages 
   - ✅ Added email verification
   - ✅ Created password reset functionality
   - ✅ Built user profile management

3. **Storage and Buckets**
   - ✅ Created `audio-cache` public bucket for storing shared audio files
   - ✅ Created `user-uploads` private bucket for user files
   - ✅ Set up appropriate security policies

### Revised Strategy

Based on the current state of the application, we've made the following strategic decisions:

1. **Data Migration Approach**
   - Decision to start fresh in Supabase without migrating legacy localStorage data
   - Users will create new content directly in the database
   - Focus on building robust data structures from the beginning rather than legacy migration

2. **Immediate Next Steps**
   - Implement direct data creation and management in Supabase
   - Build word list creation and management interfaces
   - Create progress tracking system using the database schema
   - Implement settings management in Supabase

### Implementation Progress Update (October 2023)

#### Recently Completed

1. **Word List Management**
   - ✅ Created a WordList service with full CRUD operations
   - ✅ Implemented subscription tier enforcement for list/word limits
   - ✅ Built the word list creation page with Supabase integration
   - ✅ Developed word list management page to view, delete, and navigate to lists

2. **Authentication & User Management**
   - ✅ Created a robust user authentication system
   - ✅ Implemented automatic user profile creation during signup
   - ✅ Built the `useSupabaseAuth` hook for accessing user data and subscription info

3. **Database Setup**
   - ✅ Created an API route for database initialization
   - ✅ Implemented table creation with proper RLS policies
   - ✅ Set up profile and word list schemas

#### Current Challenges

1. **Database Initialization**: 
   - Initial setup requires manual API call to create tables
   - Exploring more streamlined initialization options

2. **Error Handling**:
   - Need improved error feedback for failed database operations
   - Working on better validation messages for subscription limits

#### Next Development Priorities

1. **Complete Word List Edit Functionality**:
   - Implement the edit page for word lists
   - Add validation and subscription limits for edits

2. **Progress Tracking System**:
   - Implement progress tracking in the database
   - Build UI for displaying progress metrics

3. **Game Integration**:
   - Update the game component to use Supabase data
   - Implement real-time progress saving

4. **Pricing & Subscription UI**:
   - Create pricing page with tier comparison
   - Build subscription management interface

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

2. **Direct Supabase Integration**
   - Implement direct creation and management of data in Supabase
   - Create interfaces for adding words and word lists
   - Build user settings management in the database
   - Ensure all data operations respect subscription tier limits

3. **User-Specific Data Management**
   - Update wordlist storage logic
   - Modify progress tracking
   - Implement user settings

### Phase 3: Subscription System (Week 3)

1. **Stripe Integration**
   - Set up Stripe account and products
   - Create standard and educator subscription plans
   - Implement trial periods and coupon system
   - Set up webhook handling
   - Build checkout process and customer portal integration

2. **Subscription UI**
   - Design pricing page with tiered options
   - Create educator verification flow
   - Build subscription management interface
   - Implement upgrade/downgrade flows
   - Add payment method management
   - Create coupon redemption interface

3. **Feature Gating**
   - Create middleware for subscription checks
   - Implement feature availability based on subscription tier
   - Build fallback experiences for free users
   - Add trial access to premium features

### Phase 4: Premium Features & ElevenLabs Optimization (Week 4)

1. **Voice Management**
   - Implement voice selection based on subscription tier
   - Create limits for free tier usage
   - Add voice favorites for premium users

2. **Audio Caching**
   - Implement global audio caching with tier-based access control
   - Set up text normalization for improved cache hits
   - Create cache pruning mechanism for unused entries
   - Configure storage bucket security and access policies

3. **Enhanced Analytics**
   - Track user engagement metrics
   - Monitor conversion rates
   - Analyze feature usage patterns
   - Create educator-specific analytics

## Subscription Tiers

### Free Tier
- 5 words per list
- 2 word lists maximum
- Basic voice selection (2 voices)
- Limited daily audio generations (10 per day)
- Standard-quality audio
- Access to cached audio (when available) but limited by API call cap

### Basic Tier ($3.99/month)
- 30 words per list
- 10 word lists maximum
- Extended voice selection (5 voices)
- Increased audio generations (50 per day)
- Enhanced audio quality
- Full access to cached audio
- No ads

### Premium Tier ($7.99/month)
- Unlimited words per list
- Unlimited word lists
- All available voices
- Unlimited audio generations
- Highest audio quality
- Complete audio caching
- Priority processing
- Advanced progress analytics
- Export/import functionality

### Special Pricing

#### Educator Discounts
- **Eligibility**: Educational professionals (teachers, professors, school administrators)
- **Discount**: 50% off standard pricing
  - Educator Basic: $1.99/month (regularly $3.99/month)
  - Educator Premium: $3.99/month (regularly $7.99/month)
- **Verification**: Email domain (.edu) or manual document verification

#### Institutional Licensing
- **Target**: Schools, districts, educational organizations, or businesses
- **Features**:
  - Custom number of user accounts
  - All Premium features
  - Centralized billing
  - Administrative dashboard
  - Usage analytics for all accounts
- **Pricing Model**:
  - Custom pricing based on number of accounts
  - Volume discounts (e.g., $3/user/month for 20+ accounts)
  - Annual billing option with additional discount
  - Ability to add/remove seats as needed
- **Implementation**:
  - Custom Stripe quotes and invoices
  - Multi-seat subscription management
  - Organization admin panel
  - User provisioning system

#### Trial System
- **Default**: 7-day free trial of Premium features
- **Extended**: Up to 14-day trials available via promotions
- **Special Offers**: First 100 users get 14 days of Premium access free

#### Promotion Strategy
- **Coupon Codes**: Percentage discounts, fixed amount off, or trial extensions
- **Launch Offer**: Special incentives for early adopters
- **Referral Program**: Reward users for referring others (future implementation)

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
  is_educator boolean default false,
  trial_start_date timestamp with time zone,
  trial_end_date timestamp with time zone,
  has_used_trial boolean default false,
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
  text_hash text not null,
  voice_id text not null,
  file_path text not null,
  file_size integer not null,
  access_count integer default 0 not null,
  last_accessed timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  unique(text_hash, voice_id)
);
```

### Usage Tracking Table
```sql
create table public.usage_tracking (
  id uuid default uuid_generate_v4() not null primary key,
  user_id uuid references public.profiles not null,
  feature text not null,
  count integer default 0,
  reset_at timestamp with time zone default (now() + interval '1 day') not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(user_id, feature)
);
```

### Promotions Table
```sql
create table public.promotions (
  id uuid default uuid_generate_v4() not null primary key,
  name text not null,
  type text not null,
  value numeric,
  code text unique,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  max_uses integer,
  current_uses integer default 0,
  applies_to_tiers text[],
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
```

### User Promotions Table
```sql
create table public.user_promotions (
  id uuid default uuid_generate_v4() not null primary key,
  user_id uuid references public.profiles not null,
  promotion_id uuid references public.promotions not null,
  claimed_at timestamp with time zone default now() not null,
  applied_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);
```

### Educator Verifications Table
```sql
create table public.educator_verifications (
  id uuid default uuid_generate_v4() not null primary key,
  user_id uuid references public.profiles not null,
  status text default 'pending' not null,
  verification_method text not null,
  proof_url text,
  reviewed_by uuid references public.profiles,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
```

### Organizations Table
```sql
create table public.organizations (
  id uuid default uuid_generate_v4() not null primary key,
  name text not null,
  contact_email text not null,
  contact_name text,
  subscription_id text,
  stripe_customer_id text,
  max_seats integer not null,
  active_seats integer default 0,
  billing_frequency text default 'monthly',
  custom_price_per_seat numeric,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
```

### Organization Members Table
```sql
create table public.organization_members (
  id uuid default uuid_generate_v4() not null primary key,
  organization_id uuid references public.organizations not null,
  user_id uuid references public.profiles not null,
  role text default 'member' not null,
  is_admin boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(organization_id, user_id)
);
```

## Implementation Strategy

### Stripe Integration
- Create separate price IDs for standard and educator tiers
  - `price_basic_monthly`: $3.99/month
  - `price_premium_monthly`: $7.99/month
  - `price_educator_basic_monthly`: $1.99/month
  - `price_educator_premium_monthly`: $3.99/month
- Generate Stripe coupons linked to promotion codes
- Configure trial periods based on user eligibility
- Use Stripe Quotes API for custom institutional pricing

### Subscription Flow
1. **Sign-up**:
   - Check for eligible promotions
   - Set trial period based on promotions
   - Capture educator status if applicable
   - Check for organization invitation
2. **Trial Period**:
   - Provide Premium features until trial end
   - Show countdown to encourage conversion
3. **Checkout**:
   - Apply educator pricing if verified
   - Allow coupon code application
   - Show final price with all discounts
   - Offer organizational billing if applicable

### Educator Verification Flow
1. User indicates they are an educator during signup or in profile
2. System offers verification options:
   - Automatic via .edu email
   - Manual document upload
3. If approved, educator status and pricing is activated

### Organization Management Flow
1. **Creation**:
   - Organization admin signs up and creates organization
   - Provides required organization details
   - Selects number of seats and billing frequency
2. **User Management**:
   - Admin invites members via email
   - Manages seat assignments and permissions
   - Can promote other users to admin status
3. **Billing**:
   - Custom quote generated based on seat count
   - Invoice created and sent to organization
   - Payment processed via Stripe
   - Seats can be added/removed with billing adjustments

## Enforcement Strategy

- Use row-level security (RLS) in Supabase for data limits
- Implement middleware checks for feature access
- Add client-side checks for better UX
- Create helper hooks for subscription status checks:
  - `useSubscriptionTier()` - Returns current tier
  - `useFeatureAccess(feature)` - Checks if a specific feature is available
  - `useUsageLimit(feature)` - Returns usage limit and current usage
  - `useTrialStatus()` - Returns trial information if active
  - `usePromotion(code)` - Validates and applies promotion codes

## Testing Strategy

1. **Unit Tests**
   - Test core business logic
   - Validate subscription feature gating
   - Ensure proper data creation and retrieval
   - Verify audio caching functionality

2. **Integration Tests**
   - Test Supabase data operations
   - Verify Stripe integration
   - Validate ElevenLabs API optimization
   - Test educator verification flow

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
   - Educator program effectiveness

2. Implement event tracking for:
   - Game completions
   - ElevenLabs API calls
   - Subscription changes
   - Feature usage
   - Promotion redemptions

## Deployment Plan

1. **Development Environment**
   - Set up local development with Supabase emulator
   - Configure Stripe test mode
   - Set up educator verification testing

2. **Staging Environment**
   - Deploy to Vercel preview environment
   - Use separate Supabase instance
   - Test with Stripe test mode
   - Validate promotion and coupon flows

3. **Production Deployment**
   - Phased rollout strategy
   - Database migration approach
   - Monitoring and alerting setup
   - Post-launch promotion campaign

## Current Status & Next Steps

✅ **Completed**:
- Supabase project setup and configuration
- Authentication components and flows
- Word list creation and management with Supabase
- User profile management

🔄 **In Progress**:
- Fixing path resolution and error handling issues
- Setting up database tables through API endpoint
- Implementing subscription tier enforcement

⏭️ **Up Next**:
- Complete word list edit functionality
- Implement progress tracking in Supabase
- Update game component to use Supabase data
- Develop subscription management interface 