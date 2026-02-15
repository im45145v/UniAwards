-- Migration: Add email allowlist/regex settings
-- This allows admins to restrict which email addresses can register/login
-- Run this in Supabase SQL Editor

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
  ('email_allowlist_regex', '.*@university\.edu$', 'Regex pattern for allowed email addresses (e.g., .*@university\.edu$ for university emails only)'),
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
  -- Get settings
  SELECT value::BOOLEAN INTO allowlist_enabled
  FROM settings WHERE key = 'email_allowlist_enabled';
  
  -- If allowlist is disabled, allow all emails
  IF NOT allowlist_enabled THEN
    RETURN TRUE;
  END IF;
  
  -- Get regex pattern
  SELECT value INTO regex_pattern
  FROM settings WHERE key = 'email_allowlist_regex';
  
  -- Check if email matches the regex pattern
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
