# 🚀 Quick Setup Guide - Public Leaderboard & Email Allowlist

## ⚠️ REQUIRED: Run These Migrations in Supabase

### Migration 1: Public Leaderboard (Required)

To enable the public leaderboard feature, run this SQL in your **Supabase SQL Editor**:

```sql
-- Migration: Add public read access for leaderboard
-- This allows anonymous users to view polls, nominations, and votes

-- Drop existing policies that we're replacing
DROP POLICY IF EXISTS "polls_select_all" ON polls;
DROP POLICY IF EXISTS "nominations_select_all" ON nominations;
DROP POLICY IF EXISTS "votes_select_all" ON votes;

-- Add public SELECT policy for polls
CREATE POLICY "polls_select_public" ON polls
  FOR SELECT TO anon, authenticated
  USING (true);

-- Add public SELECT policy for nominations (only approved ones)
CREATE POLICY "nominations_select_public" ON nominations
  FOR SELECT TO anon, authenticated
  USING (approved = true);

-- Add public SELECT policy for votes
CREATE POLICY "votes_select_public" ON votes
  FOR SELECT TO anon, authenticated
  USING (true);
```

### Migration 2: Email Allowlist (Optional but Recommended)

To restrict who can register/login based on email address patterns, run this SQL:

```sql
-- Migration: Add email allowlist/regex settings
-- This allows admins to restrict which email addresses can register/login

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES users(id)
);

-- Insert default email settings
INSERT INTO settings (key, value, description) VALUES
  ('email_allowlist_enabled', 'false', 'Enable email allowlist restriction'),
  ('email_allowlist_regex', '.*@university\\.edu$', 'Regex pattern for allowed email addresses (e.g., .*@university\\.edu$ for university emails only)'),
  ('email_allowlist_message', 'Access is currently limited to university students. Please use your university email address to sign in.', 'Message shown to users with non-allowed email addresses')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view settings
CREATE POLICY "settings_select_admin" ON settings
  FOR SELECT TO authenticated
  USING (is_admin());

-- Policy: Only admins can update settings
CREATE POLICY "settings_update_admin" ON settings
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create function to check if email is allowed
CREATE OR REPLACE FUNCTION is_email_allowed(email_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  allowlist_enabled BOOLEAN;
  regex_pattern TEXT;
BEGIN
  SELECT value::BOOLEAN INTO allowlist_enabled
  FROM settings WHERE key = 'email_allowlist_enabled';
  
  IF NOT allowlist_enabled THEN
    RETURN TRUE;
  END IF;
  
  SELECT value INTO regex_pattern
  FROM settings WHERE key = 'email_allowlist_regex';
  
  RETURN email_address ~* regex_pattern;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get allowlist message
CREATE OR REPLACE FUNCTION get_allowlist_message()
RETURNS TEXT AS $$
DECLARE
  message TEXT;
BEGIN
  SELECT value INTO message
  FROM settings WHERE key = 'email_allowlist_message';
  RETURN message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ✨ What These Migrations Do

### Public Leaderboard (Migration 1):
- ✅ Allows **anyone** to view polls (no login required)
- ✅ Allows **anyone** to see approved nominations
- ✅ Allows **anyone** to see vote counts (for the leaderboard)
- ✅ Base URL (`/`) shows public leaderboard automatically

### Email Allowlist (Migration 2):
- ✅ **Admin control** over who can register/login
- ✅ **Regex-based** email pattern matching (e.g., only @university.edu)
- ✅ **Friendly rejection messages** for unauthorized emails
- ✅ **Admin panel** to configure settings (go to Admin → Settings)
- 🔒 Protections still in place for write operations

---

## 🎯 How to Use Email Allowlist

After running Migration 2:

1. **Login as admin**
2. Go to **Admin Dashboard → Settings**
3. **Enable Email Allowlist** toggle
4. **Set regex pattern** (examples provided in UI):
   - `.*@university\.edu$` - Only @university.edu emails
   - `.*@(university|college)\.edu$` - Multiple domains
   - `^student.*@university\.edu$` - Emails starting with "student"
5. **Customize rejection message** (shown to non-allowed users)
6. **Test** your regex with the built-in tester
7. **Save settings**

**Example rejection message:**
> "Access is currently limited to university students. Please use your university email address to sign in."

---

## 🔧 Troubleshooting: Login Issues

If you're experiencing "Token has expired or is invalid" errors:

### Common Causes:
1. **Migration not run**: The policies above must be executed first
2. **Email OTP not configured**: Check Supabase Auth settings
3. **Email provider issues**: Check if codes are being sent

### Fix Auth Configuration:
1. Go to **Authentication → Providers** in Supabase
2. Enable **Email** provider
3. **Disable** "Confirm email" (for easier testing)
4. **Enable** "Email OTP"
5. Test by sending a code to your email

### If Codes Expire Too Quickly:
- OTP codes are valid for **60 seconds** by default
- Use the new **"Resend code"** button if needed
- Codes can only be used once

### Recent Fixes Applied:
- ✅ Fixed email trimming consistency between send/verify
- ✅ Added "Resend code" button for expired codes
- ✅ Improved error messages for expired tokens
- ✅ Added validation for missing email during verification

---

**Note:** If you're setting up a new database, use `supabase/setup.sql` instead, which already includes these policies.

