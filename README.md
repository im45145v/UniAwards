# 🏆 UniAwards - University Yearbook Awards Platform

A full-stack web application for university yearbook awards — featuring nomination, approval, voting, analytics, and an admin dashboard.

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS, ShadCN UI
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Libraries:** Framer Motion (animations), Recharts (analytics charts)

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd UniAwards
npm install
```

### 2. Set Up Supabase

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL setup from `supabase/setup.sql` in the Supabase SQL Editor
3. Enable **Email Auth** in **Authentication → Providers → Email**
   - Disable "Confirm email" (for faster testing)
   - Enable "Email OTP"
4. Create a storage bucket named `nominations` (set to public)
5. Copy your project URL and anon key

### 3. Configure Environment

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide to Vercel.

## Features

### Authentication
- Email OTP code verification via Supabase
- Default role assignment to voter

### User Roles
- **admin** — Full access to admin dashboard
- **voter** — Can vote in polls
- **viewer** — Can browse polls and leaderboards

### Pages
- **Login** — Email OTP code sign-in (6-digit code)
- **Dashboard** — Browse polls with status badges and action buttons
- **Nominate** — Submit nominations with optional image upload
- **Vote** — Cast votes on approved nominees (one vote per poll)
- **Leaderboard** — View results with charts and animated progress bars
- **Admin Dashboard** — Manage polls, moderate nominations, control users, toggle voting, view analytics

## Database Schema

See `supabase/setup.sql` for the complete schema and policies including:
- `users` — id, email, role
- `polls` — id, title, description, status, ends_at
- `nominations` — id, poll_id, nominee_name, image_url, approved
- `votes` — id, poll_id, nomination_id, user_id (UNIQUE constraint on user_id + poll_id)

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard pages
│   ├── auth/callback/  # OAuth callback handler
│   ├── dashboard/      # Main dashboard
│   ├── leaderboard/    # Results & rankings
│   ├── login/          # Login page
│   ├── nominate/       # Nomination form
│   └── vote/           # Voting UI
├── components/
│   ├── admin/          # Admin-specific components
│   ├── layout/         # Navbar, sidebar
│   └── ui/             # ShadCN UI components
└── lib/
    ├── supabase/       # Supabase client setup
    ├── constants.ts    # App constants
    ├── types.ts        # TypeScript types
    └── utils.ts        # Utility functions
```
