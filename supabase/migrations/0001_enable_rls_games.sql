-- Fix: "rls_disabled_in_public" on public.games (Supabase security advisor, 08 Jun 2026)
-- Without RLS, anyone holding the anon key (exposed in the browser) could read,
-- edit, and delete the games registry. Enable RLS with a public read-only policy.
-- Writes continue to work because the seed endpoints use the service-role key,
-- which bypasses RLS entirely.
--
-- Run this in the Supabase SQL Editor for project who-won (ltvfspioqlprlpqnvhyx).
-- Idempotent: safe to run more than once.

alter table public.games enable row level security;

drop policy if exists "Games viewable by everyone" on public.games;
create policy "Games viewable by everyone" on public.games for select using (true);

-- Verification: this should now return zero rows. Any row listed is a public
-- table that still has RLS disabled and needs the same treatment.
select schemaname, tablename
from pg_tables
where schemaname = 'public'
  and rowsecurity = false;
