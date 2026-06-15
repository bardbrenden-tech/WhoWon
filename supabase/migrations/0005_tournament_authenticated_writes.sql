-- Faithful record of the hardening applied LIVE on 15 Jun 2026 directly in the
-- Supabase SQL Editor (project who-won, ltvfspioqlprlpqnvhyx) in response to the
-- Security Advisor warnings. Live ended up STRICTER than what 0002/0003 describe,
-- so this migration is the source of truth for the production policy state.
-- Idempotent: safe to run more than once.

-- ------------------------------------------------------------------
-- ratings: writes are service-role only (Elo is computed and upserted by
-- /api/sessions/complete using the service-role key, which bypasses RLS).
-- Drop every write policy so the browser can never insert/update/delete a
-- rating. The public SELECT policy "Ratings viewable by everyone" stays.
-- (Supersedes the interim policies from 0002 and matches 0003's intent.)
-- ------------------------------------------------------------------
drop policy if exists "System can manage ratings" on public.ratings;
drop policy if exists "Authenticated users insert ratings" on public.ratings;
drop policy if exists "Authenticated users update ratings" on public.ratings;

-- ------------------------------------------------------------------
-- handle_new_user() is SECURITY DEFINER and only needs to run as the
-- on_auth_user_created trigger (triggers fire without EXECUTE on the role).
-- Revoke direct execute from public/anon/authenticated.
-- ------------------------------------------------------------------
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;

-- ------------------------------------------------------------------
-- tournament_players / tournament_matches: the original policies granted
-- writes to PUBLIC (anonymous included). Scope writes to `authenticated`
-- instead of the tournament creator, because TournamentView.tsx gates the
-- "set winner" UI on `userId` only (any logged-in user can record results),
-- not on ownership. Creator-only (as in 0002) would silently break result
-- recording for non-creators. This blocks anonymous writes while preserving
-- current app behaviour. Public SELECT policies stay (leaderboards/brackets).
-- NOTE: the advisor still lists these as "RLS Policy Always True" because it
-- flags using(true)/with check(true) regardless of role — cosmetic, not a hole.
-- ------------------------------------------------------------------
drop policy if exists "Auth users can insert tournament players" on public.tournament_players;
drop policy if exists "Creator manages tournament players" on public.tournament_players;
drop policy if exists "Auth users manage tournament players" on public.tournament_players;
create policy "Auth users manage tournament players" on public.tournament_players
  for all to authenticated using (true) with check (true);

drop policy if exists "Auth users can manage matches" on public.tournament_matches;
drop policy if exists "Creator manages tournament matches" on public.tournament_matches;
drop policy if exists "Auth users manage matches" on public.tournament_matches;
create policy "Auth users manage matches" on public.tournament_matches
  for all to authenticated using (true) with check (true);

-- Verification: the "manage" policies should now show {authenticated};
-- the "viewable by everyone" SELECT policies stay {public}.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('tournament_matches', 'tournament_players')
order by tablename, policyname;
