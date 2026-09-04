-- BlueForce — Supabase schema
--
-- This file mirrors what is already applied to the project. It is the source of
-- truth for a fresh environment; run it once in SQL Editor > New query.
--
-- Flow it supports:
--   worker registers -> completes profile (status 'pending')
--   admin reviews    -> approves or rejects
--   customer browses approved workers -> requests an appointment
--   worker accepts / declines / completes the booking

-- ---------------------------------------------------------------- categories
create table if not exists public.worker_categories (
  slug       text primary key,
  name       text not null,
  sort_order integer not null default 0
);

insert into public.worker_categories (slug, name, sort_order) values
  ('electrician',     'Electrician',          1),
  ('plumber',         'Plumber',              2),
  ('carpenter',       'Carpenter',            3),
  ('welder',          'Welder',               4),
  ('painter',         'Painter',              5),
  ('mason',           'Mason',                6),
  ('construction',    'Construction Worker',  7),
  ('mechanic',        'Mechanic',             8),
  ('driver',          'Driver',               9),
  ('gardener',        'Gardener',            10),
  ('cook',            'Cook',                11),
  ('delivery',        'Delivery Executive',  12),
  ('office-boy',      'Office Boy',          13),
  ('lift-technician', 'Lift Technician',     14)
on conflict (slug) do nothing;

-- ------------------------------------------------------------------ profiles
create table if not exists public.profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references auth.users (id) on delete cascade,
  role             text not null default 'customer' check (role in ('worker', 'customer', 'admin')),

  full_name        text not null default '',
  email            text,
  mobile           text,
  location         text,
  profile_photo    text,

  -- Worker-only fields.
  category         text references public.worker_categories (slug),
  experience_years numeric check (experience_years is null or experience_years >= 0),
  hourly_rate      numeric check (hourly_rate is null or hourly_rate >= 0),
  skills           text[] not null default '{}',
  bio              text,
  rating           numeric not null default 0 check (rating >= 0 and rating <= 5),

  -- Admin verification. Workers land as 'pending'; everyone else is auto-approved.
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  verified_at      timestamptz,
  verified_by      uuid references auth.users (id) on delete set null,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ------------------------------------------------------------------ bookings
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references auth.users (id) on delete cascade,
  worker_id     uuid not null references auth.users (id) on delete cascade,
  scheduled_for timestamptz not null,
  address       text not null,
  description   text,
  status        text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint bookings_customer_is_not_worker check (customer_id <> worker_id)
);

-- Second pair of foreign keys, straight to profiles: PostgREST cannot embed
-- profiles through the auth.users keys when listing a booking with its parties.
alter table public.bookings
  drop constraint if exists bookings_customer_profile_fkey,
  add  constraint bookings_customer_profile_fkey
       foreign key (customer_id) references public.profiles (user_id) on delete cascade;

alter table public.bookings
  drop constraint if exists bookings_worker_profile_fkey,
  add  constraint bookings_worker_profile_fkey
       foreign key (worker_id) references public.profiles (user_id) on delete cascade;

create index if not exists profiles_user_id_idx     on public.profiles (user_id);
create index if not exists profiles_role_status_idx on public.profiles (role, status);
create index if not exists profiles_category_idx    on public.profiles (category);
create index if not exists bookings_customer_id_idx on public.bookings (customer_id);
create index if not exists bookings_worker_id_idx   on public.bookings (worker_id);
create index if not exists bookings_status_idx      on public.bookings (status);

-- ------------------------------------------------------- privilege guardrails
-- SECURITY DEFINER so it reads profiles without re-entering RLS, which would
-- otherwise recurse when a profiles policy calls it.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $fn$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$fn$;

grant execute on function public.is_admin() to anon, authenticated;

-- A non-admin may only create a worker/customer row, never an approved or admin one.
-- The clamps below stop a signed-in user editing their own role or verification
-- status. They deliberately do not apply when auth.uid() is null - that means a
-- trusted server-side context (SQL editor, service role), which is how the first
-- admin gets promoted. Safe because both write policies are `to authenticated`,
-- so an anon caller is rejected by RLS before any trigger runs.
create or replace function public.enforce_profile_defaults()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is null or new.role not in ('worker', 'customer') then
      new.role := 'customer';
    end if;
    new.status           := case when new.role = 'worker' then 'pending' else 'approved' end;
    new.rejection_reason := null;
    new.verified_at      := null;
    new.verified_by      := null;
    new.rating           := 0;
  end if;
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$fn$;

-- On update a non-admin cannot change role, verification state or rating,
-- whatever the client sends.
create or replace function public.protect_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role             := old.role;
    new.status           := old.status;
    new.rejection_reason := old.rejection_reason;
    new.verified_at      := old.verified_at;
    new.verified_by      := old.verified_by;
    new.rating           := old.rating;
  end if;
  new.user_id    := old.user_id;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end;
$fn$;

create or replace function public.protect_booking_columns()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  new.customer_id := old.customer_id;
  new.worker_id   := old.worker_id;
  new.created_at  := old.created_at;
  new.updated_at  := now();
  return new;
end;
$fn$;

-- Create the profile the moment the auth user exists, carrying the role chosen
-- at sign-up. This lives in the database because with email confirmation enabled
-- there is no session at sign-up, so the client cannot insert the row - and the
-- chosen role would be lost by the time the person confirms and logs in.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $fn$
declare
  chosen_role text;
begin
  -- OAuth sign-ups (Google) carry no role: the provider owns that metadata, and
  -- there is no way to inject one before the account exists. The app creates the
  -- profile right after the redirect, using the role picked beforehand.
  if coalesce(new.raw_app_meta_data->>'provider', 'email') <> 'email' then
    return new;
  end if;

  chosen_role := case
    when new.raw_user_meta_data->>'role' in ('worker', 'customer')
      then new.raw_user_meta_data->>'role'
    else 'customer'
  end;

  insert into public.profiles (user_id, role, full_name, email, status)
  values (
    new.id,
    chosen_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    case when chosen_role = 'worker' then 'pending' else 'approved' end
  )
  on conflict (user_id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger functions must not be reachable at /rest/v1/rpc/*.
revoke all on function public.enforce_profile_defaults()   from anon, authenticated, public;
revoke all on function public.protect_profile_privileges() from anon, authenticated, public;
revoke all on function public.protect_booking_columns()    from anon, authenticated, public;
revoke all on function public.handle_new_user()            from anon, authenticated, public;

drop trigger if exists profiles_enforce_defaults on public.profiles;
create trigger profiles_enforce_defaults
  before insert on public.profiles
  for each row execute function public.enforce_profile_defaults();

drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

drop trigger if exists bookings_protect_columns on public.bookings;
create trigger bookings_protect_columns
  before update on public.bookings
  for each row execute function public.protect_booking_columns();

-- ----------------------------------------------------------------------- RLS
alter table public.profiles          enable row level security;
alter table public.bookings          enable row level security;
alter table public.worker_categories enable row level security;

drop policy if exists "categories are readable by everyone" on public.worker_categories;
create policy "categories are readable by everyone"
  on public.worker_categories for select using (true);

-- Own row always; approved workers publicly (so customers can browse); admins all.
drop policy if exists "profiles are selectable" on public.profiles;
create policy "profiles are selectable"
  on public.profiles for select
  using (
    auth.uid() = user_id
    or (role = 'worker' and status = 'approved')
    or public.is_admin()
    -- Each party to a booking may read the other's profile (name, phone), but
    -- only while a booking links them.
    or exists (
      select 1 from public.bookings b
      where (b.customer_id = auth.uid() and b.worker_id = profiles.user_id)
         or (b.worker_id   = auth.uid() and b.customer_id = profiles.user_id)
    )
  );

drop policy if exists "users insert their own profile" on public.profiles;
create policy "users insert their own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "admins delete profiles" on public.profiles;
create policy "admins delete profiles"
  on public.profiles for delete to authenticated
  using (public.is_admin());

drop policy if exists "bookings are selectable" on public.bookings;
create policy "bookings are selectable"
  on public.bookings for select to authenticated
  using (auth.uid() = customer_id or auth.uid() = worker_id or public.is_admin());

-- A customer books an approved worker, on their own behalf only.
drop policy if exists "customers create their own bookings" on public.bookings;
create policy "customers create their own bookings"
  on public.bookings for insert to authenticated
  with check (
    auth.uid() = customer_id
    and exists (
      select 1 from public.profiles w
      where w.user_id = bookings.worker_id
        and w.role = 'worker'
        and w.status = 'approved'
    )
  );

drop policy if exists "participants update their bookings" on public.bookings;
create policy "participants update their bookings"
  on public.bookings for update to authenticated
  using (auth.uid() = customer_id or auth.uid() = worker_id or public.is_admin())
  with check (auth.uid() = customer_id or auth.uid() = worker_id or public.is_admin());

drop policy if exists "admins delete bookings" on public.bookings;
create policy "admins delete bookings"
  on public.bookings for delete to authenticated
  using (public.is_admin());

-- ------------------------------------------------- worker / customer views
-- Workers and customers share one physical table: bookings reference a single
-- profiles.user_id, and the role guards are written against it. These views
-- split them for reading, so each appears separately in the Table Editor and
-- can be queried on its own.
--
-- security_invoker = on is essential. Without it a view runs as its owner and
-- bypasses row level security, which would expose every profile - customers and
-- unapproved workers included - to anonymous callers.

create or replace view public.workers
with (security_invoker = on) as
select
  id, user_id, full_name, email, mobile, location, profile_photo,
  category, experience_years, hourly_rate, skills, bio, rating,
  status, rejection_reason, verified_at, verified_by,
  created_at, updated_at
from public.profiles
where role = 'worker';

-- Deliberately omits the ten worker-only columns; they mean nothing here.
create or replace view public.customers
with (security_invoker = on) as
select
  id, user_id, full_name, email, mobile, location, profile_photo,
  created_at, updated_at
from public.profiles
where role = 'customer';

comment on view public.workers is
  'Worker profiles only. Reading view - writes still go to public.profiles. RLS from profiles applies.';
comment on view public.customers is
  'Customer profiles only, without worker-specific columns. Reading view - writes still go to public.profiles.';

grant select on public.workers   to anon, authenticated;
grant select on public.customers to anon, authenticated;

-- --------------------------------------------------------- creating an admin
-- Register normally through the app first, then promote that account:
--
--   update public.profiles
--      set role = 'admin', status = 'approved'
--    where email = 'you@example.com';
--
-- Admins then sign in at /admin/login with their normal password.
