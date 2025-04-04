# Implementation Plan: Child-Centric Subscription Model

## Overview

This document outlines the step-by-step plan to implement the revised child-centric subscription model, associated features (Child Profiles, Progress Tracking, Sharing Links), necessary database updates, and administrative functionalities. The goal is to make incremental changes, ensure successful builds, and incorporate testing throughout the process.

## Phase 1: Foundational Database Updates [COMPLETED - Via Manual SQL Execution]

**Goal:** Update the Supabase schema to support the new features, subscription model, and basic administrative needs.

1.  **Implement `organizations` Table:** [COMPLETED]
    *   **Schema:** Created `organizations` table (id, name, address details, website, timestamps).
    *   **RLS:** Applied (Public read, Authenticated insert, Admin update/delete via placeholder function).
    *   **Testing:** Basic schema verified.

2.  **Implement `child_profiles` Table:** [COMPLETED]
    *   **Schema:** Created `child_profiles` table (id, parent\_user\_id (FK to profiles), name, avatar\_url, timestamps).
    *   **RLS:** Applied (Parent/owner has full CRUD access).
    *   **Testing:** Basic schema verified. Tier limit enforcement MUST be implemented in backend logic during Phase 2 API development.

3.  **Implement `progress_records` Table:** [COMPLETED]
    *   **Schema:** Created `progress_records` table (id, child\_profile\_id (FK), word\_list\_id (FK), activity\_type, score, duration, completed\_at, metadata, created\_at).
    *   **RLS:** Applied (Parent can read linked records. Direct client writes disallowed).
    *   **Testing:** Basic schema verified. Backend insertion testing required in Phase 2/3.

4.  **Implement `shared_activity_links` Table:** [COMPLETED]
    *   **Schema:** Created `shared_activity_links` (id, unique\_link\_code (unique), parent\_user\_id (FK), child\_profile\_id (FK), word\_list\_id (FK), activity\_type, is\_active, expires\_at, created\_at).
    *   **RLS:** Applied (Parent/owner full management. Public read for active links).
    *   **Testing:** Basic schema verified. Tier enforcement for creation MUST be implemented in backend logic during Phase 3 API development.

5.  **Implement `organization_members` Table:** [COMPLETED]
    *   **Schema:** Created `organization_members` (id, user\_id (FK), organization\_id (FK), role, grade\_level, teacher\_name, member\_status, timestamps, unique(user\_id, organization\_id)).
    *   **RLS:** Applied (User view self. User insert pending request. Admin management via placeholder function).
    *   **Testing:** Basic schema verified. Admin management RLS depends on function implementation in Phase 6.

6.  **Implement `promotions` Table:** [COMPLETED]
    *   **Schema:** Created `promotions` table (id, code (unique), type, value, duration, duration\_in\_months, max\_redemptions, expires\_at, description, is\_active, created\_by (FK), timestamps).
    *   **RLS:** Applied (Admin users (`profiles.is_admin = true`) full CRUD access).
    *   **Testing:** Basic schema verified. Admin CRUD access testing in Phase 6.

7.  **Implement `user_promotions` Table:** [COMPLETED]
    *   **Schema:** Created `user_promotions` table (id, user\_id (FK), promotion\_id (FK), redeemed\_at, unique(user\_id, promotion_id)).
    *   **RLS:** Applied (Admins read all. Users read own. Direct client writes disallowed).
    *   **Testing:** Basic schema verified. Backend insertion testing required during checkout flow implementation.

8.  **Modify `word_lists` Table:** [COMPLETED]
    *   **Schema:** Added columns: `is_publicly_shared`, `public_share_id`.
    *   **RLS:** Applied (Owner full CRUD. Public read via share ID).
    *   **Testing:** Basic schema verified. Tier enforcement for enabling sharing MUST be implemented in backend logic during Phase 3 API development.

9.  **Modify `profiles` Table:** [COMPLETED]
    *   **Schema:** Added columns: `is_educator`, `educator_verification_status`, `is_admin`.
    *   **RLS:** Applied (User read/update self (with restrictions). Admins can update verification status).
    *   **Testing:** Basic schema verified. Admin update testing in Phase 6.

10. **Create Helper Functions (Placeholders):** [COMPLETED - Placeholder Defined]
    *   Defined placeholder SQL function `check_is_org_admin`. Logic implementation deferred to Phase 6.
    *   **Note:** Tier/limit checks MUST be handled in backend logic, not DB functions at this stage.

11. **Apply GRANT Statements:** [COMPLETED]
    *   Granted appropriate permissions to roles (`anon`, `authenticated`, `service_role`) according to RLS policies.

12. **Update Database Setup Script/Process:** [PENDING]
    *   Needs update if an automated script (`/api/setup`?) exists.
    *   Manual setup steps are documented by the SQL execution process we just completed.

13. **Update `LAUNCH_CHECKLIST.md`:** [PENDING]
    *   Needs update to reflect the completed Phase 1 schema and RLS.

## Phase 1.5: Application Structure Refactoring [COMPLETED]

**Goal:** Reorganize the application's file and folder structure according to the agreed-upon pattern to improve maintainability and prepare for new features.

**Target Structure Reference:**

```plaintext
app/
├── (marketing)/
│   ├── page.tsx              # Home page
│   └── ...
├── account/
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── children/
│   │   │   ├── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── AddChildProfileForm.tsx
│   │   │   │   └── ChildProfileList.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useChildProfiles.ts
│   │   │   └── [childId]/
│   │   │       ├── components/
│   │   │       │   ├── EditChildProfileForm.tsx
│   │   │       │   └── DeleteChildProfileConfirmation.tsx
│   │   │       └── progress/
│   │   │           ├── page.tsx
│   │   │           ├── components/
│   │   │           │   └── ProgressDisplayTable.tsx
│   │   │           └── hooks/
│   │   │               └── useProgressRecords.ts
│   │   └── subscription/
│   │   └── settings/
│   └── contexts/
│       └── ActiveChildContext.tsx
├── api/
│   ├── account/
│   │   └── child-profiles/
│   │       ├── route.ts
│   │       └── [profileId]/
│   │           └── route.ts
│   ├── progress/
│   │   └── route.ts
│   ├── auth/
│   ├── webhooks/
│   └── ...
├── auth/
├── components/               # SHARED UI Kit (Catalyst Wrappers) - READ ONLY
├── game/
├── hooks/                    # SHARED Custom Hooks
├── lib/                      # SHARED Libraries/Utilities
├── providers/                # SHARED Global Context Providers
├── services/                 # SHARED Service integrations
├── state/                    # SHARED Global State Management
├── types/                    # SHARED TypeScript types
├── utils/                    # SHARED Utility functions
├── wordlist/
├── globals.css
├── layout.tsx                # Root layout

# Outside app/
tests/                      # [COMPLETED]
├── setup/                  # [COMPLETED]
└── unit/                   # [COMPLETED]
debug/                      # [COMPLETED]
tests/integration/          # [COMPLETED] (Moved from app/test)
tests/supabase/             # [COMPLETED] (Moved from app/test-supabase)
```

**Steps:**

1.  **Create Top-Level `tests/` Directory:** [COMPLETED]
    *   Create `tests/` in the project root.
    *   Create `tests/setup/` and `tests/unit/` subdirectories.
    *   **Build & Commit:** Ran `pnpm build`, commit changes with message "chore: Setup tests directory structure".
2.  **Move Existing Test/Debug Folders:** [COMPLETED]
    *   Move `app/debug/` to `debug/` (root level).
    *   Move `app/test/` to `tests/integration/` (or similar, decide best location for existing tests). Review if `app/test/` contained actual routes.
    *   Move `app/test-supabase/` to `tests/supabase/` (or similar).
    *   **Important:** If any moved folders contained test files (`.test.ts` or `.test.tsx`), ensure they are moved to corresponding locations under the new `tests/` structure or co-located if more appropriate (evaluate case-by-case).
    *   **Build & Commit:** Ran `pnpm build`, commit changes with message "refactor: Relocate test and debug folders".
3.  **Create `(marketing)` Route Group & Move Homepage:** [PENDING]
    *   Create `app/(marketing)/` directory.
    *   Move `app/page.tsx` to `app/(marketing)/page.tsx`.
    *   Move `app/page.test.tsx` (if it exists) to `app/(marketing)/page.test.tsx`.
    *   Remove original `app/page.tsx` (and its test file if moved).
    *   **Build & Commit:** Run `pnpm build`, commit changes with message "refactor: Create (marketing) route group and move homepage".
4.  **Create `account/` Feature Folder & Structure:**
    *   Create `app/account/`.
    *   Create `app/account/(protected)/` route group.
    *   Create `app/account/(protected)/children/`.
    *   Create `app/account/(protected)/children/[childId]/`.
    *   Create `app/account/(protected)/children/[childId]/progress/`.
    *   Create placeholder folders for feature-specific components/hooks within these new directories (`components/`, `hooks/`).
    *   **Build & Commit:** Run `pnpm build`, commit changes with message "feat: Setup account feature folder structure".
5.  **Create `api/` Subfolders:**
    *   Create `app/api/account/`.
    *   Create `app/api/account/child-profiles/`.
    *   Create `app/api/account/child-profiles/[profileId]/`.
    *   Create `app/api/progress/`.
    *   **Build & Commit:** Run `pnpm build`, commit changes with message "feat: Setup API route structure for account and progress".
6.  **Review & Cleanup Existing `app/` Folders:**
    *   Review the contents and purpose of `app/progress/`. Delete if redundant after creating `app/api/progress/` and `app/account/(protected)/children/[childId]/progress/`.
    *   Review `app/share/`. Keep for Phase 3, or rename/move if a better structure is identified later.
    *   Review `app/ui/`. Confirm if it contains necessary base elements not covered by `app/components/`. Delete if redundant.
    *   **(If deletions occur) Build & Commit:** Run `pnpm build`, commit changes with message "refactor: Cleanup potentially redundant app folders".
7.  **Verify Imports & Fix:**
    *   Manually or using IDE tools, check and update all import paths affected by the moved files/folders.
    *   Run `pnpm build` and `pnpm lint` iteratively, fixing any broken imports or type errors until the build succeeds without errors.
8.  **Final Commit:**
    *   Commit the import fixes with message "fix: Update imports after structural refactoring".

## Phase 2: Core Feature Implementation - Child Profiles & Basic Progress

**Goal:** Implement the user interface and backend logic for managing Child Profiles and basic progress recording *within the new structure*.

**Refined Steps:**

**1. Child Profile Management UI**

*   **1a. Location & Routing:**
    *   **Task:** Child Profile management lives at `/account/children`.
    *   **Task:** Create the page file: `app/account/(protected)/children/page.tsx`.
    *   **Task:** Create placeholder test file: `app/account/(protected)/children/page.test.tsx`.
*   **1b. Data Fetching Hooks:**
    *   **Task:** Create Tanstack Query hook `app/account/(protected)/children/hooks/useChildProfiles.ts`.
    *   **Task:** Create placeholder test file: `app/account/(protected)/children/hooks/useChildProfiles.test.ts`.
    *   **Task:** Create/Identify hook `app/hooks/useSubscriptionInfo.ts` (shared hook).
    *   **Task:** Create/Identify placeholder test file `app/hooks/useSubscriptionInfo.test.ts`.
*   **1c. List Display Component:**
    *   **Task:** Create `app/account/(protected)/children/components/ChildProfileList.tsx`.
    *   **Task:** Create placeholder test file: `app/account/(protected)/children/components/ChildProfileList.test.tsx`.
    *   **Props:** Needs profiles array, `onEdit`, `onDelete` handlers, tier limit/current count.
    *   **Display:** Name, Avatar (`@components/avatar.tsx`), Edit button, Delete button.
*   **1d. Add Child Profile Component:**
    *   **Task:** Create `app/account/(protected)/children/components/AddChildProfileForm.tsx`, likely using `@components/dialog.tsx`.
    *   **Task:** Create placeholder test file: `app/account/(protected)/children/components/AddChildProfileForm.test.tsx`.
    *   **Trigger:** "Add Child" button (`@components/button.tsx`) on `/account/children` page, disabled if limit reached.
    *   **Form:** Use React Hook Form + Zod. Fields: `name` (required `@components/input.tsx`), `avatar_url` (optional `@components/input.tsx`).
    *   **Client Check:** Disable submission/provide feedback if limit reached.
    *   **Action:** Call "Create Child Profile" API endpoint. Provide feedback (`@components/alert.tsx`?).
*   **1e. Edit Child Profile Component:**
    *   **Task:** Create `app/account/(protected)/children/[childId]/components/EditChildProfileForm.tsx`, likely using `@components/dialog.tsx`.
    *   **Task:** Create placeholder test file: `app/account/(protected)/children/[childId]/components/EditChildProfileForm.test.tsx`.
    *   **Trigger:** "Edit" button in `ChildProfileList`.
    *   **Form:** Pre-fill with data. Fields: `name`, `avatar_url`.
    *   **Action:** Call "Update Child Profile" API endpoint.
*   **1f. Delete Child Profile Component:**
    *   **Task:** Create `app/account/(protected)/children/[childId]/components/DeleteChildProfileConfirmation.tsx` using `@components/dialog.tsx`.
    *   **Task:** Create placeholder test file: `app/account/(protected)/children/[childId]/components/DeleteChildProfileConfirmation.test.tsx`.
    *   **Trigger:** "Delete" button in `ChildProfileList`.
    *   **Display:** Confirmation message: "Are you sure...? Progress data will be lost."
    *   **Action:** On confirm (`@components/button.tsx`), call "Delete Child Profile" API endpoint.
*   **1g. Integration:**
    *   **Task:** Assemble components on `app/account/(protected)/children/page.tsx`. Manage dialog states. Fetch data. Wire up actions. Display loading/error states.
*   **Assumption:** Avatar URL input is sufficient for now.

**2. Child Profile API Endpoints**

*   **2a. Endpoint Strategy:** Use Next.js API Routes under `app/api/account/child-profiles/`.
*   **2b. Create Endpoint:** `POST /api/account/child-profiles`
    *   **Task:** Implement logic in `app/api/account/child-profiles/route.ts`.
    *   **Task:** Receive `{ name, avatar_url? }`.
    *   **Task:** Fetch user's tier and current profile count.
    *   **Task:** **Implement Backend Tier Limit Check:** Return 4xx error if limit exceeded.
    *   **Task:** If allowed, insert into `child_profiles` via Supabase client (RLS allows). Return created profile.
*   **2c. Update Endpoint:** `PUT /api/account/child-profiles/[profileId]`
    *   **Task:** Implement logic in `app/api/account/child-profiles/[profileId]/route.ts`.
    *   **Task:** Receive `{ name?, avatar_url? }` and `profileId`.
    *   **Task:** Update `child_profiles` record via Supabase client (RLS ensures owner). Return updated profile.
*   **2d. Delete Endpoint:** `DELETE /api/account/child-profiles/[profileId]`
    *   **Task:** Implement logic in `app/api/account/child-profiles/[profileId]/route.ts`.
    *   **Task:** Receive `profileId`.
    *   **Task:** Delete `child_profiles` record via Supabase client (RLS ensures owner). Return success status.

**3. Basic Progress Recording API**

*   **3a. Endpoint:** `POST /api/progress`
    *   **Task:** Implement logic in `app/api/progress/route.ts`.
*   **3b. Input Handling:**
    *   **Task:** Design payload to handle source ('app' or 'link'). E.g., check for `child_profile_id` vs `shared_activity_link_code`.
    *   **Input Fields:** `word_list_id`, `activity_type`, `score`, `duration_seconds`, `metadata`, plus identifier (`child_profile_id` or `shared_activity_link_code`).
*   **3c. Validation & Logic:**
    *   **Task:** If `shared_activity_link_code`: Validate link (exists, active, not expired). Extract necessary IDs.
    *   **Task:** If `child_profile_id`: Validate caller auth (needed for `service_role` use).
    *   **Task:** Validate common result fields.
*   **3d. Insertion:**
    *   **Task:** Use Supabase client **with `service_role` key** to insert into `progress_records`.
    *   **Task:** Return success/failure status.

**4. Integrate Progress Recording**

*   **4a. Identify Component:** Locate primary game/activity UI component(s).
*   **4b. Active Child Profile State:**
    *   **Task:** Implement way to select/track active child profile (React Context suggested).
    *   **Design:** Decide how user selects active child (e.g., dropdown before activity).
*   **4c. Trigger & API Call:**
    *   **Task:** Find game completion event.
    *   **Task:** Gather data (`activeChildProfileId`, `word_list_id`, results).
    *   **Task:** Call `POST /api/progress` endpoint.
*   **4d. UI Feedback:**
    *   **Task:** Show loading/success/error states during submission.

**5. Basic Progress Display UI**

*   **5a. Location & Routing:**
    *   **Task:** Progress shown at `/account/children/[childId]/progress`.
    *   **Task:** Create page file `app/account/(protected)/children/[childId]/progress/page.tsx`.
    *   **Task:** Create placeholder test file `app/account/(protected)/children/[childId]/progress/page.test.tsx`.
*   **5b. Child Selection:**
    *   **Task:** Implement child selection on parent page (`/account/children`) or via navigation/tabs linking to `/[childId]/progress`.
*   **5c. Data Fetching Hook & Backend:**
    *   **Task:** Create Tanstack Query hook `app/account/(protected)/children/[childId]/progress/hooks/useProgressRecords.ts`.
    *   **Task:** Create placeholder test file `app/account/(protected)/children/[childId]/progress/hooks/useProgressRecords.test.ts`.
    *   **Task:** **Create Backend Mechanism (API Route or RPC):** This backend piece is needed to JOIN `progress_records` with `word_lists` (to get list name) and return data to the hook. Suggestion: New API route like `GET /api/account/child-profiles/[childId]/progress`. Implement in `app/api/account/child-profiles/[childId]/progress/route.ts` (requires creating this route).
    *   **Data Needed:** `progress_records.id`, `completed_at`, `activity_type`, `score`, `word_lists.name`.
*   **5d. Display Component:**
    *   **Task:** Create `app/account/(protected)/children/[childId]/progress/components/ProgressDisplayTable.tsx` using `@components/table.tsx`.
    *   **Task:** Create placeholder test file `app/account/(protected)/children/[childId]/progress/components/ProgressDisplayTable.test.tsx`.
    *   **Props:** Accepts fetched progress records array.
    *   **Columns:** Display "Date", "Activity", "List Name", "Score".
*   **5e. Integration:**
    *   **Task:** Connect child selection/navigation to the `.../[childId]/progress/page.tsx`. Display table. Handle loading/error states.

## Phase 3: Sharing Features Implementation

**Goal:** Implement both Sharable Activity Links and Public Word List Sharing.

1.  **Sharable Activity Link Generation:**
    *   **UI:** Create UI elements (e.g., a button on the `app/wordlist/...` or `app/account/(protected)/children/[childId]/...` view) allowing eligible users (Basic+) to select a word list and a child profile to generate a link.
    *   **API:** Create an endpoint (e.g., `POST /api/share/activity-link`). Checks user auth/tier, generates code, inserts into `shared_activity_links`, returns URL (`app.com/activity/[code]`). Implement in `app/api/share/activity-link/route.ts` (requires creating structure).
    *   **UI:** Display the generated link to the user with options to copy it.
    *   **Testing:** Unit tests for link code generation (if placed in a testable utility function). API tests (integration/e2e). E2E test generating a link.

2.  **Public Activity Page:**
    *   Create a new page route `app/activity/[linkCode]/page.tsx`.
    *   This page fetches details from `shared_activity_links` based on the `linkCode`.
    *   It loads the corresponding word list data and launches the activity component *without requiring login*.
    *   On activity completion, it calls the progress recording API (from Phase 2, Step 3), passing the `unique_link_code` or necessary identifiers derived from it.
    *   Handle cases where the link is invalid, inactive, or expired.
    *   **Testing:** E2E tests accessing the page with a valid code, completing the activity, and verifying progress is recorded for the correct child profile. Test invalid/expired link scenarios.

3.  **Public Word List Sharing - Toggling:**
    *   **UI:** Add a toggle/button in the word list management area (`app/wordlist/...`) for owners (Basic+).
    *   **API:** Create an endpoint (e.g., `POST /api/wordlist/[listId]/share`). Checks auth/ownership/tier, updates `word_lists` table, returns public URL (`app.com/list/shared/[shareId]`). Implement in `app/api/wordlist/[listId]/share/route.ts` (requires creating structure).
    *   **UI:** Display the public link when sharing is enabled.
    *   **Testing:** API tests for toggling sharing status based on tier/ownership. E2E test toggling sharing.

4.  **Public Word List View Page:**
    *   Create a new page route `app/list/shared/[shareId]/page.tsx`.
    *   Fetches word list data based on the `public_share_id` (using public RLS policy).
    *   Displays list details (name, description, words).
    *   Implement click-to-play audio for words, prioritizing the global audio cache. Define behavior if audio is not cached (e.g., button disabled or requires login).
    *   Display different CTAs based on user state:
        *   Logged Out: "Sign Up for Free Trial", "Log In".
        *   Logged In: "Clone List to My Account".
    *   **Testing:** E2E test viewing a public list (logged in and out). Test audio playback from cache. Test CTAs.

5.  **Clone List Functionality:**
    *   **API:** Create an endpoint (e.g., `POST /api/wordlist/clone`). Needs `public_share_id` in body. Checks requesting user's tier limits, creates new list. Implement in `app/api/wordlist/clone/route.ts` (requires creating structure).
    *   The endpoint fetches the original list data.
    *   Checks the *requesting user's* tier limits (max lists, max words per list).
    *   If limits allow, creates a *new* `word_lists` record owned by the requesting user, copying the relevant data (name, description, words). Does *not* copy sharing status.
    *   Handle cases where cloning exceeds tier limits.
    *   **UI:** Implement the "Clone List" button action on the public view page, calling this API endpoint and providing user feedback (success, or failure due to limits).
    *   **Testing:** API tests for cloning, including success and limit-exceeded scenarios. E2E test cloning a list.

## Phase 4: Subscription System Alignment

**Goal:** Update Stripe configuration, UI, and backend logic to match the new subscription model.

1.  **Update Stripe Products/Prices:**
    *   Ensure Stripe products and prices accurately reflect the Free, Basic ($3.99), and Premium ($7.99) tiers, potentially including Educator variants if launching them.
    *   Update associated metadata in Stripe if necessary.

2.  **Update Pricing Page UI:**
    *   Redesign the pricing page to clearly articulate the features of each tier, focusing on:
        *   Number of Child Profiles
        *   Word List / Word Limits
        *   Progress Tracking level (None / Basic / Advanced)
        *   Sharing capabilities (Activity Links / Public List Sharing)
        *   Voice options / Audio quality / Generation limits
    *   Ensure Educator pricing/verification info is presented clearly if applicable.

3.  **Update Subscription Management UI:**
    *   Ensure the user's current tier and limits (especially child profile count) are clearly displayed in their account settings.
    *   Update upgrade/downgrade flows to reflect the new tiers.

4.  **Update Webhook Handler:**
    *   Modify the Stripe webhook handler (likely still `app/api/webhooks/stripe/route.ts`).
    *   Ensure it handles upgrades, downgrades, cancellations, and trial endings correctly according to the new tier structure.
    *   **Testing:** Simulate Stripe events (using Stripe CLI or webhooks UI) for different scenarios and verify the database is updated correctly.

5.  **Refine Feature Gating Logic:**
    *   Review and update all middleware and client-side checks (`useSubscriptionTier`, `useFeatureAccess` hooks) to enforce limits and access based on the *new* tier definitions (child profile count, sharing permissions, progress tracking access).
    *   **Testing:** Thoroughly test accessing features and hitting limits across all tiers (Free, Basic, Premium, potentially during Trial).

## Phase 5: Testing, Refinement, and Launch Prep

**Goal:** Ensure application stability, polish the user experience, and complete pre-launch checks.

1.  **Comprehensive Testing:**
    *   Execute full regression tests covering all features across different tiers.
    *   Perform thorough testing of all sharing flows and edge cases.
    *   Conduct user acceptance testing (UAT) if possible.
    *   Run tests outlined in the updated `LAUNCH_CHECKLIST.md`.

2.  **UI/UX Polish:**
    *   Refine loading states, error messages, and transitions for all new features.
    *   Ensure consistent design language.
    *   Gather feedback and make adjustments.

3.  **Documentation Updates:**
    *   Update user guides, FAQs, Privacy Policy, and Terms of Service to reflect all new features and data handling practices (especially regarding child profiles).

4.  **Final Launch Checklist Review:**
    *   Go through the updated `LAUNCH_CHECKLIST.md` item by item to ensure all prerequisites are met.

## Phase 6: Admin Interface Implementation (NEW)

**Goal:** Build the necessary backend APIs and frontend UI for administrative tasks. *Place admin routes under `/admin` and corresponding APIs under `/api/admin`.*

1.  **Educator Verification Management:**
    *   **Backend:** Create API endpoints protected for admins (`is_admin=true`) at `app/api/admin/educator-verifications/...`.
    *   **Frontend:** Create an admin-only section/page under `app/admin/educator-verifications/`.
    *   **Testing:** API tests for admin endpoints. E2E tests for the verification workflow from an admin perspective.

2.  **Promotion Code Management (CRUD):**
    *   **Backend:** Create API endpoints protected for admins at `app/api/admin/promotions/...`.
    *   **Frontend:** Create an admin-only section/page under `app/admin/promotions/`.
    *   **Testing:** API tests for promotion CRUD endpoints. E2E tests for managing promotions.

3.  **Promotion Redemption Viewing:**
    *   **Backend:** Create an API endpoint protected for admins at `app/api/admin/promotion-redemptions/`.
    *   **Frontend:** Display redemption history within the admin section, possibly `app/admin/promotions/redemptions/`.
    *   **Testing:** API tests for fetching redemption data. E2E test viewing history.

4.  **Admin User Management (Basic):**
    *   **Backend:** API endpoint for super-admins at `app/api/admin/users/manage-admins/...`.
    *   **Frontend:** UI for super-admins under `app/admin/users/`.
    *   **Testing:** Test granting/revoking admin privileges.

5.  **Implement Helper Functions:**
    *   Implement the actual logic for database functions like `check_is_org_admin` if complex RLS checks are required for organization management beyond basic admin flags.

6.  **Refine Admin UI/UX:**
    *   Ensure the admin interface is clear, secure, and efficient for required tasks. 