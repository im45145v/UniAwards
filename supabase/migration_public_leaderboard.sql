-- Migration: Add public read access for leaderboard
-- This allows anonymous users to view polls, nominations, and votes
-- Run this in Supabase SQL Editor

-- Drop existing policies that we'll be replacing
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
