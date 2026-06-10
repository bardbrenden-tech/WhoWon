-- Lock public.ratings to service-role writes only.
-- Elo is now computed and written by /api/sessions/complete using the
-- service-role key (which bypasses RLS), so the browser never writes ratings.
-- Removing the permissive write policies clears the "RLS Policy Always True"
-- advisor warning while keeping public read access for leaderboards.
--
-- Run in the Supabase SQL Editor for project who-won (ltvfspioqlprlpqnvhyx).
-- Idempotent: safe to run more than once.

-- Drop interim authenticated-write policies from 0002.
drop policy if exists "Authenticated users insert ratings" on public.ratings;
drop policy if exists "Authenticated users update ratings" on public.ratings;
-- Also drop the original overly-permissive policy if it's still present.
drop policy if exists "System can manage ratings" on public.ratings;

-- The public read policy "Ratings viewable by everyone" (select using true)
-- stays. With no write policy, only the service role can insert/update/delete.

-- Verification: ratings should now have exactly one policy (the SELECT one).
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'ratings';
