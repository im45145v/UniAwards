export type UserRole = "admin" | "voter" | "viewer";

export type PollStatus =
  | "NOMINATION_OPEN"
  | "NOMINATION_CLOSED"
  | "VOTING_OPEN"
  | "VOTING_CLOSED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  status: PollStatus;
  ends_at: string | null;
  created_at: string;
}

export interface Nomination {
  id: string;
  poll_id: string;
  nominee_name: string;
  image_url: string | null;
  nominated_by_user_id: string;
  approved: boolean;
  created_at: string;
}

export interface NominationWithUser extends Nomination {
  users?: { email: string } | null;
}

export interface Vote {
  id: string;
  poll_id: string;
  nomination_id: string;
  user_id: string;
  created_at: string;
}

export interface NominationWithVotes extends Nomination {
  vote_count: number;
}
