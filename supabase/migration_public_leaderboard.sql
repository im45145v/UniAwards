-- Migration: Add public read access for leaderboard
-- This allows anonymous users to view polls, nominations, and votes
-- Run this in Supabase SQL Editor

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
