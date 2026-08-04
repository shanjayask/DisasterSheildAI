/*
# Add onboarding_completed column to profiles

## Summary
Adds an explicit `onboarding_completed` boolean column to the `profiles` table
so the app can reliably determine whether a user has finished the onboarding flow,
instead of inferring it from the presence of country/latitude values.

## Changes
- `profiles.onboarding_completed` (boolean, NOT NULL, default false)
  - Set to true when the user completes the onboarding wizard.
  - On future logins, if true, the app skips onboarding and goes straight to /dashboard.

## Data migration
- Existing profiles that already have a country and latitude set are marked as
  onboarding_completed = true, since those fields are the previous heuristic for
  "onboarding done". All other rows default to false.

## Security
- No RLS policy changes. The existing owner-scoped CRUD policies on profiles
  already cover the new column (column-level privileges are not restricted).
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

UPDATE profiles
  SET onboarding_completed = true
  WHERE country IS NOT NULL
    AND latitude IS NOT NULL;
