# UniAwards Deployment Guide

## Quick Deploy to Vercel (Free)

### 1. Restart Dev Server
Stop the current dev server (Ctrl+C) and restart:
```bash
npm run dev
```

### 2. Build Test
```bash
npm run build
```
Ensure build succeeds with no errors.

### 3. Supabase Setup
Go to your Supabase project dashboard:

**Run Complete Setup SQL:**
- Go to SQL Editor
- Run all SQL from `supabase/setup.sql`

**Create Storage Bucket:**
- Go to Storage
- Create a new bucket: `nominations`
- Set to Public

**Enable Realtime (for live results):**
- Go to Database → Replication
- Enable Realtime for `votes` table

### 4. Deploy to Vercel
1. Visit https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository: `im45145v/UniAwards`
4. Framework: Next.js (auto-detected)
5. Build Command: `npm run build`
6. Output Directory: `.next` (default)
7. Install Command: `npm install`

### 5. Environment Variables
In Vercel → Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://fzgibtdkvqjtnvlglgdc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-anon-key
```

### 6. Deploy
Click "Deploy" and wait ~2 minutes.

Your app will be live at: `https://uni-awards-*.vercel.app`

---

## Post-Deployment

### Set Admin User
1. Login to your app with your email
2. Go to Supabase → Table Editor → users
3. Find your user row
4. Change `role` from `voter` to `admin`
5. Refresh the app - you'll now see the Admin link

### Configure Email (Optional)
For production, configure custom SMTP in Supabase:
- Authentication → Email Templates → SMTP Settings
- Use Gmail, SendGrid, or AWS SES

---

## Troubleshooting

### Build Fails on Vercel
- Check build logs for TypeScript errors
- Run `npm run build` locally first
- Ensure all environment variables are set

### "MIDDLEWARE_INVOCATION_FAILED"
- Ensure only `proxy.ts` exists (not `middleware.ts`)
- Check Supabase environment variables are correct

### RLS Policy Errors
- Run `supabase/setup.sql` in Supabase SQL Editor
- Verify all tables have RLS enabled
- Check admin function exists

### Live Results Not Updating
- Enable Realtime for `votes` table in Supabase
- Check browser console for WebSocket errors

### Images Not Loading
- Verify storage bucket `nominations` exists and is public
- Run storage policies from `setup.sql`

---

## Custom Domain (Optional)

1. In Vercel → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown
4. Certificate is automatic

---

## Monitoring

- **Vercel Dashboard**: View deployment logs, analytics
- **Supabase Dashboard**: Monitor database queries, auth logs
- **Error Tracking**: Add Sentry or similar (optional)

---

## Scaling

Free tier limits:
- **Vercel**: 100GB bandwidth, unlimited requests
- **Supabase**: 500MB database, 1GB file storage

For higher limits, upgrade to paid tier or consider:
- Vercel Pro ($20/mo)
- Supabase Pro ($25/mo)
