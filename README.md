This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm (we use pnpm exclusively for this project)

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Code Quality and Verification

Before committing changes, run the verification script to ensure type safety and build integrity:

```bash
pnpm check:all
```

This will:
1. Run TypeScript type checking
2. Run ESLint 
3. Perform a test build

## Environment Variables

Copy `.env.example` to `.env.local` and update with your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- Supabase configuration
- ElevenLabs API key
- Stripe credentials (for subscription features)

## Project Structure

This project follows a feature-based folder structure within the `app/` directory:
- `app/auth` - Authentication related components and routes
- `app/game` - Game functionality 
- `app/wordlist` - Word list management
- `app/components` - Shared UI components
- `app/hooks` - Reusable React hooks
- `app/lib` - Shared utilities and service clients
- `app/services` - Business logic and API service layers

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deployment

The application is configured for deployment on Vercel. The main branch is automatically deployed to production.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Migration to Supabase & Subscription Model

Wordle Wramble is transitioning from a client-side application that uses localStorage to a full-stack application with Supabase for backend services. This migration includes:

1. User authentication and accounts
2. Data migration from localStorage to Supabase
3. Tiered subscription model using Stripe
4. Optimized ElevenLabs API usage based on subscription levels

### Setting Up the Database

To set up the Supabase database schema:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and API keys to `.env.local` following the `.env.example` format:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (from Project Settings → API)
3. Execute the SQL scripts in the Supabase Dashboard:
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor" in the left sidebar
   - Open and run the file `migrations/01_initial_schema.sql` to create all tables
   - Open and run the file `migrations/02_rls_policies.sql` to set up Row Level Security

4. Create storage buckets in the Supabase Dashboard:
   - Navigate to "Storage" in the left sidebar
   - Create a new bucket named `audio-cache` (set to public)
   - Create a new bucket named `user-uploads` (set to private)

Alternatively, for more automated bucket creation, you can run:
```bash
pnpm init:supabase
```

This will create all necessary tables, RLS policies, and storage buckets.

### Subscription Tiers

The application offers three subscription tiers:

- **Free Tier**
  - 5 words per list
  - 2 word lists maximum
  - Basic voice selection (2 voices)
  - Limited daily audio generations (10 per day)

- **Basic Tier ($3.99/month)**
  - 30 words per list
  - 10 word lists maximum
  - Extended voice selection (5 voices)
  - Increased audio generations (50 per day)

- **Premium Tier ($7.99/month)**
  - Unlimited words per list
  - Unlimited word lists
  - All available voices
  - Unlimited audio generations

Special educator pricing (50% discount) is available with verification.

### Data Migration

When users first sign in, they'll be prompted to migrate their existing data from localStorage to their Supabase account. The migration process:

1. Collects all word lists and progress from localStorage
2. Applies appropriate limits based on the user's subscription tier
3. Transfers the data to Supabase with progress tracking
4. Preserves localStorage data as a backup until explicitly deleted
