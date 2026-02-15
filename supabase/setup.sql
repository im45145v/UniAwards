-- UniAwards Supabase setup (schema + RLS policies + storage policies)
-- Run this once in Supabase SQL Editor for a new project.

-- =========================
-- Schema
-- =========================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'voter', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'NOMINATION_OPEN' CHECK (status IN ('NOMINATION_OPEN', 'NOMINATION_CLOSED', 'VOTING_OPEN', 'VOTING_CLOSED')),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  nominee_name TEXT NOT NULL,
  image_url TEXT,
  nominated_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  nomination_id UUID NOT NULL REFERENCES nominations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_vote_per_poll UNIQUE (user_id, poll_id)
);

CREATE INDEX idx_nominations_poll_id ON nominations(poll_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_nomination_id ON votes(nomination_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- =========================
-- RLS Policies
-- =========================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_admin());

-- Polls
CREATE POLICY "polls_select_all" ON polls
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "polls_admin_insert" ON polls
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "polls_admin_update" ON polls
  FOR UPDATE TO authenticated
  USING (is_admin());

CREATE POLICY "polls_admin_delete" ON polls
  FOR DELETE TO authenticated
  USING (is_admin());

-- Nominations
CREATE POLICY "nominations_select_all" ON nominations
  FOR SELECT TO anon, authenticated
  USING (approved = true);

CREATE POLICY "nominations_insert_own" ON nominations
  FOR INSERT TO authenticated
  WITH CHECK (nominated_by_user_id = auth.uid());

CREATE POLICY "nominations_admin_update" ON nominations
  FOR UPDATE TO authenticated
  USING (is_admin());

CREATE POLICY "nominations_admin_delete" ON nominations
  FOR DELETE TO authenticated
  USING (is_admin());

-- Votes
CREATE POLICY "votes_select_all" ON votes
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "votes_insert_own" ON votes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =========================
-- Storage
-- =========================
-- Create bucket: CREATE BUCKET 'nominations' (public);
-- Policies for storage.objects:
--
-- CREATE POLICY "nominations_upload" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'nominations');
--
-- CREATE POLICY "nominations_public_read" ON storage.objects
--   FOR SELECT USING (bucket_id = 'nominations');
