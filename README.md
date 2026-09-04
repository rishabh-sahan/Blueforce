# BlueForce

A booking platform for blue-collar workers. React 18 + TypeScript + Vite +
Tailwind, with Supabase for auth, data and row-level security. UI is available
in English, Hindi and Kannada.

## How it works

Three roles, one flow:

1. **Worker** registers, picks a trade, and completes a profile (experience,
   hourly rate, skills, city). The profile starts as `pending`.
2. **Admin** reviews it in the admin panel and approves or rejects it with a
   reason. A worker who is not approved never appears in search.
3. **Customer** browses approved workers, then requests an appointment with a
   date, address and description. The worker accepts or declines it, and marks
   it completed afterwards.

Approval is enforced in the database, not just the UI: the RLS policy on
`profiles` only exposes workers whose status is `approved`, and the insert
policy on `bookings` re-checks that the worker is approved before allowing a
booking.

## Setup

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Fill in `.env` with the values from Supabase (Project Settings > API):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

Create the tables by running `supabase/schema.sql` once in the Supabase
dashboard, under SQL Editor > New query. It is idempotent.

### Creating the first admin

Admins are ordinary accounts with `role = 'admin'`. Register through the app,
then promote yourself:

```sql
update public.profiles
   set role = 'admin', status = 'approved'
 where email = 'you@example.com';
```

Sign in at `/admin/login`. There is no shared admin password — the role lives in
the database, so RLS enforces it server-side.

### Email confirmation

If "Confirm email" is on under Authentication > Providers > Email, new accounts
must click the emailed link before they can sign in. The role chosen at sign-up
survives this: it is stored in the auth user's metadata and a trigger creates
the matching profile row. Turning confirmation off makes local testing easier.

Note that Supabase rate-limits confirmation emails (a handful per hour on the
free tier); signups will fail with `over_email_send_rate_limit` beyond that.

## Commands

```bash
npm run dev        # dev server at http://localhost:5173
npm run build      # tsc -b && vite build, output in dist/
npm run preview    # serve the production build
npm run lint       # eslint
```

## Layout

```
src/
  main.tsx                entry point
  App.tsx                 routes + layout shell
  lib/
    supabase.ts           Supabase client, reads from .env
    motion.ts             shared easing / entrance variants
  contexts/AuthContext    session, profile, role helpers
  services/
    profiles.ts           worker directory, profile edits, admin queries
    bookings.ts           create / list / transition bookings
  types/database.ts       row shapes mirroring supabase/schema.sql
  components/
    ui/                   shared design system (PageHero, Card, Button, …)
    layout/               sticky glass Header, Footer
    home/                 slider, feature strip, testimonials
    RequireAuth.tsx       route guard (signed in, and optionally by role)
  pages/
    Home, AboutUs, Services, HowItWorks
    BrowseWorkers         public directory of approved workers
    WorkerDetail          worker profile + booking form
    Onboarding            worker profile completion
    auth/                 Login, Register
    dashboard/Dashboard   role-aware: worker requests / customer bookings
    profile/Profile       edit your own details
    admin/                AdminLogin, AdminLayout, Verification, Users, Bookings
  i18n/                   en, hi, kn translations
supabase/schema.sql       tables, triggers, RLS policies
```

## Routes

| Route | Access |
| --- | --- |
| `/`, `/about-us`, `/services`, `/how-it-works` | public |
| `/workers`, `/workers/:id` | public (approved workers only) |
| `/login`, `/register` | public |
| `/onboarding` | signed in |
| `/dashboard` | worker or customer |
| `/profile` | signed in |
| `/admin/login` | public |
| `/admin/verification`, `/admin/users`, `/admin/bookings` | admin only |
