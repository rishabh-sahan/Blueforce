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

### Google sign-in

The code is in place; the provider still needs credentials, which are tied to
your Google account. Until these steps are done the button returns
`Unsupported provider: provider is not enabled`.

**1. Google Cloud Console** — https://console.cloud.google.com

- Create (or pick) a project, then *APIs & Services > OAuth consent screen*.
  Choose **External**, fill in app name, support email and developer email.
  While the app is in *Testing*, add your own Google address under
  **Test users**, or nobody else can sign in.
- *APIs & Services > Credentials > Create credentials > OAuth client ID*,
  application type **Web application**.
- **Authorised JavaScript origins**:
  ```
  http://localhost:5173
  https://your-production-domain
  ```
- **Authorised redirect URI** — this one points at Supabase, not at your app:
  ```
  https://lttofiohmcvxayyjbrbh.supabase.co/auth/v1/callback
  ```
- Copy the **Client ID** and **Client secret**.

**2. Supabase** — Authentication > Providers > Google

- Enable it, paste the Client ID and Client secret, save.

**3. Supabase** — Authentication > URL Configuration

- **Site URL**: `http://localhost:5173` for development.
- **Redirect URLs**: add both, since the app returns to `/auth/callback`:
  ```
  http://localhost:5173/auth/callback
  https://your-production-domain/auth/callback
  ```

A redirect URL that is not on that list is rejected after Google returns, and
the sign-in silently fails — it is the step most often missed.

**How the role is decided.** Google tells us a name, an email and a picture,
never whether someone is a worker or a customer. The Register page already asks,
so the choice made there is carried across the redirect and applied when the
profile row is created on return. Workers then land on the onboarding form
(prefilled with their Google name and photo) to pick a trade and rate; customers
go straight to the dashboard. Anyone signing in with Google from the *Login*
page for the first time is treated as a customer.

### Email confirmation

If "Confirm email" is on under Authentication > Providers > Email, new accounts
must click the emailed link before they can sign in. The role chosen at sign-up
survives this: it is stored in the auth user's metadata and a trigger creates
the matching profile row. Turning confirmation off makes local testing easier.

Note that Supabase rate-limits confirmation emails (a handful per hour on the
free tier); signups will fail with `over_email_send_rate_limit` beyond that.

## Deploying to Vercel

Import the repository at https://vercel.com/new. The Vite preset is detected
automatically, and [`vercel.json`](vercel.json) pins the rest: `npm run build`
into `dist/`, long-lived caching for hashed assets, and — the part that matters
for a single-page app — a rewrite sending every unmatched path to
`index.html`. Without that rewrite a refresh on `/workers/<id>`, or Google's
return to `/auth/callback`, is a 404 from the CDN before React ever loads.

**1. Environment variables** — Project Settings > Environment Variables, for
Production, Preview and Development:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

These are inlined at build time, so a change to either only takes effect on the
next deploy. The build fails with a named-variable error if they are missing,
rather than shipping a page that is blank apart from a console error.

Only the publishable (anon) key belongs here — it is public by design and the
database is guarded by RLS. The service-role key must never be added to a
`VITE_`-prefixed variable: everything with that prefix is compiled into the
JavaScript bundle and served to every visitor.

**2. Point auth at the deployed domain.** The redirect is derived from
`window.location.origin`, so nothing in the code changes, but both consoles need
to know the new origin — see [Google sign-in](#google-sign-in) above:

- Supabase > Authentication > URL Configuration — set **Site URL** to
  `https://your-app.vercel.app` and add `https://your-app.vercel.app/auth/callback`
  to **Redirect URLs**, keeping the localhost entries for development.
- Google Cloud Console > Credentials — add `https://your-app.vercel.app` to
  **Authorised JavaScript origins**. The authorised *redirect URI* stays
  pointed at Supabase and does not change.

Preview deployments get a fresh URL per commit, which no allowlist can
anticipate; Google sign-in therefore only works on Production and on any
custom domain you add explicitly. Supabase accepts a wildcard such as
`https://your-project-*.vercel.app/auth/callback` under **Redirect URLs** if
previews need it too.

**3. Verify after the first deploy** — load a deep link such as
`/workers` directly (not by clicking through from `/`) and confirm it renders
instead of 404ing, then sign in.

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
    GoogleButton.tsx      "Continue with Google", carries the chosen role
  pages/
    Home, AboutUs, Services, HowItWorks
    BrowseWorkers         public directory of approved workers
    WorkerDetail          worker profile + booking form
    Onboarding            worker profile completion
    auth/                 Login, Register, AuthCallback (Google return)
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
| `/login`, `/register`, `/auth/callback` | public |
| `/onboarding` | signed in |
| `/dashboard` | worker or customer |
| `/profile` | signed in |
| `/admin/login` | public |
| `/admin/verification`, `/admin/users`, `/admin/bookings` | admin only |
