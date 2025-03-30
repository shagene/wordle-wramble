# Launch Checklist for Wordle Wramble v1

## Pre-Launch Database Setup
- [ ] Run database setup endpoint to create required tables
  ```bash
  curl "http://localhost:3000/api/setup?key=d7x8_BK9#mP$vL2@qN5^hJ4*wR6&tY3%gC1!zF8~nX0(kM7)sQ4+jW9"
  ```
- [ ] Verify tables in Supabase:
  - [ ] `profiles` table exists with correct schema
  - [ ] `word_lists` table exists with correct schema
  - [ ] `setup_logs` table exists with correct schema
  - [ ] RLS policies are properly configured
- [ ] Test user authentication flow
- [ ] Test profile creation on signup
- [ ] Verify subscription tier enforcement

## Domain and Deployment
- [ ] Purchase domain name
- [ ] Configure DNS settings
- [ ] Update Vercel project with custom domain
- [ ] Configure SSL certificate
- [ ] Update environment variables in Vercel:
  - [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
  - [ ] Disable setup endpoint (`SETUP_ENABLED=false`)
  - [ ] Update allowed IPs if needed
  - [ ] Verify all API keys are properly set

## Subscription System
- [ ] Set up Stripe account
- [ ] Configure subscription tiers in Stripe:
  - [ ] Free Tier (default)
  - [ ] Basic Tier ($3.99/month)
  - [ ] Premium Tier ($7.99/month)
- [ ] Set up webhook endpoints
- [ ] Add Stripe keys to environment:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Test subscription flows:
  - [ ] Upgrade from Free to Basic
  - [ ] Upgrade from Basic to Premium
  - [ ] Downgrade scenarios
  - [ ] Cancellation flow
  - [ ] Payment failure handling

## ElevenLabs Integration
- [ ] Verify ElevenLabs API key is working
- [ ] Test voice generation limits
- [ ] Implement audio caching system
- [ ] Configure rate limiting
- [ ] Test fallback to browser TTS

## Security Checks
- [ ] Run security audit
- [ ] Check for exposed API keys
- [ ] Verify RLS policies
- [ ] Test authentication edge cases
- [ ] Configure CORS policies
- [ ] Set up error monitoring
- [ ] Enable logging for critical operations

## Performance Optimization
- [ ] Run Lighthouse audits
- [ ] Optimize image assets
- [ ] Configure caching headers
- [ ] Test load times
- [ ] Verify API response times
- [ ] Check database query performance
- [ ] Set up monitoring for:
  - [ ] Server response times
  - [ ] API endpoints
  - [ ] Database queries
  - [ ] Error rates

## User Experience
- [ ] Test responsive design
- [ ] Verify all animations and transitions
- [ ] Check loading states
- [ ] Test error messages
- [ ] Verify form validations
- [ ] Test accessibility features
- [ ] Check cross-browser compatibility

## Content and Documentation
- [ ] Update privacy policy
- [ ] Update terms of service
- [ ] Create user documentation
- [ ] Write help/FAQ section
- [ ] Prepare support documentation
- [ ] Create account deletion instructions

## Analytics and Monitoring
- [ ] Set up analytics tracking
- [ ] Configure conversion tracking
- [ ] Set up error tracking
- [ ] Create monitoring dashboard
- [ ] Set up alerts for:
  - [ ] Error spikes
  - [ ] Performance issues
  - [ ] API failures
  - [ ] Database issues

## Backup and Recovery
- [ ] Configure database backups
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Set up automated backups
- [ ] Test disaster recovery plan

## Post-Launch Tasks
- [ ] Monitor error logs
- [ ] Watch performance metrics
- [ ] Track user feedback
- [ ] Monitor subscription conversions
- [ ] Check analytics data
- [ ] Verify email notifications
- [ ] Test support workflows

## Future Development Environment
- [ ] Plan development database setup
- [ ] Document environment separation
- [ ] Create staging environment
- [ ] Set up CI/CD pipelines
- [ ] Configure test automation

## Notes
- Current Vercel deployment uses auto-generated URL
- Working directly with production Supabase until v1 launch
- Local development points to production database
- Will set up separate development environment post-launch

## Important URLs and Resources
- Supabase Dashboard: https://gwvhbimnktyovdmdcdnm.supabase.co
- Current Vercel Deployment: [Add your current Vercel URL]
- Stripe Dashboard: [Add after setup]
- ElevenLabs Dashboard: [Add your dashboard URL]

## Environment Variables Reference
```env
# Required for Launch
NEXT_PUBLIC_APP_URL=your-production-domain
NEXT_PUBLIC_SUPABASE_URL=https://gwvhbimnktyovdmdcdnm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
NEXT_PUBLIC_ELEVEN_LABS_API_KEY=[your-elevenlabs-key]
STRIPE_SECRET_KEY=[your-stripe-secret]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your-stripe-publishable]
STRIPE_WEBHOOK_SECRET=[your-webhook-secret]

# Post-Launch Settings
SETUP_ENABLED=false
```

## Contact Information
- Technical Support: [Add contact]
- Emergency Contact: [Add contact]
- Domain Provider: [Add after purchase]
- DNS Provider: [Add after setup] 