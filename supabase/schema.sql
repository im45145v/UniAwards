-- Supabase SQL Schema for UniAwards

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'voter', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'NOMINATION_OPEN' CHECK (status IN ('NOMINATION_OPEN', 'NOMINATION_CLOSED', 'VOTING_OPEN', 'VOTING_CLOSED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nominations table
CREATE TABLE nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  nominee_name TEXT NOT NULL,
  image_url TEXT,
  nominated_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  nomination_id UUID NOT NULL REFERENCES nominations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_vote_per_poll UNIQUE (user_id, poll_id)
);

-- Indexes
CREATE INDEX idx_nominations_poll_id ON nominations(poll_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_nomination_id ON votes(nomination_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- Storage bucket for nomination images
-- Run in Supabase dashboard: CREATE BUCKET 'nominations' (public);
