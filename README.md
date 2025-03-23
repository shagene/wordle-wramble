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
