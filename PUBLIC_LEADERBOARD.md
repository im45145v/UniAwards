# Public Leaderboard Migration Guide

## Overview
This migration adds a public leaderboard page that displays all polls and their results without requiring authentication.

## Changes Made

### 1. Database Policies (RLS)
Updated Row Level Security policies to allow anonymous (unauthenticated) users to read:
- **Polls**: All polls are now publicly readable
- **Nominations**: Only approved nominations are publicly readable
- **Votes**: All votes are publicly readable (for counting purposes)

### 2. Files Updated

#### Database Schema Files
- `supabase/setup.sql` - Updated with public access policies
- `supabase/schema.sql` - Updated with public access policies  
- `supabase/migration_public_leaderboard.sql` - Migration script for existing databases

#### Application Files
- `src/app/leaderboard/page.tsx` - New public leaderboard page
- `src/components/public-leaderboard-content.tsx` - Component to display all polls with expandable leaderboards
- `src/components/layout/navbar.tsx` - Added "Leaderboard" link to navigation

## Migration Steps

### For Existing Databases
If you already have a Supabase database set up, run the migration script:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migration_public_leaderboard.sql`
4. Click **Run**

### For New Databases
The updated `supabase/setup.sql` already includes the public access policies. Just run it as normal.

## Features

### Public Leaderboard Page (`/leaderboard`)
- **No authentication required** - Anyone can view the leaderboard
- **All polls displayed** - Shows every poll in the system
- **Expandable sections** - Click to expand/collapse each poll's full leaderboard
- **Top 3 preview** - When collapsed, shows the top 3 nominees with vote counts
- **Real-time data** - Shows current vote counts and percentages
- **Responsive design** - Works on mobile and desktop

### Navigation
- Authenticated users see a "Leaderboard" button in the navbar
- Public leaderboard page shows "Login" button for unauthenticated users
- Public leaderboard page shows "Dashboard" button for authenticated users

## Security Considerations

### What's Public
- Poll titles, descriptions, and status
- Approved nominations (name and image)
- Vote counts (aggregated, not individual votes)

### What's Protected
- User information remains private
- Only approved nominations are visible publicly
- Write operations (creating polls, nominations, votes) still require authentication
- Admin functions remain protected

## URL Structure
- `/leaderboard` - Public leaderboard showing all polls
- `/leaderboard/[pollId]` - Individual poll leaderboard (requires authentication, existing feature)

## Testing the Changes

1. Visit `/leaderboard` without logging in
2. Verify that all polls are visible
3. Check that you can expand/collapse each poll
4. Verify vote counts are accurate
5. Ensure login/dashboard buttons work correctly

## Rollback
If you need to revert these changes, run the following SQL in Supabase:

```sql
-- Remove public access policies
DROP POLICY IF EXISTS "polls_select_public" ON polls;
DROP POLICY IF EXISTS "nominations_select_public" ON nominations;
DROP POLICY IF EXISTS "votes_select_public" ON votes;

-- Restore authenticated-only policies
CREATE POLICY "polls_select_authenticated" ON polls
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "nominations_select_authenticated" ON nominations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "votes_select_authenticated" ON votes
  FOR SELECT TO authenticated
  USING (true);
```
