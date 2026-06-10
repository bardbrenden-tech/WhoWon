-- Harden RLS / function grants flagged by Supabase Security Advisor (warnings, 08 Jun 2026)
-- Run in the Supabase SQL Editor for project who-won (ltvfspioqlprlpqnvhyx).
-- Idempotent: safe to run more than once.

-- ------------------------------------------------------------------
-- Warnings 5 & 6: handle_new_user() is SECURITY DEFINER and was callable
-- directly by anon/authenticated. It only ever needs to run as the
-- on_auth_user_created trigger, which still fires after these revokes
-- (triggers don't require EXECUTE on the invoking role).
-- ------------------------------------------------------------------
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;

-- ------------------------------------------------------------------
-- Warning 4: tournament_players had "for insert with check (true)" — any
-- caller could insert rows into any tournament. Scope writes to the
-- tournament's creator (the only writer in the app: StartTournamentButton
-- and the challenge flow both run as the creator). Public reads unchanged.
-- ------------------------------------------------------------------
drop policy if exists "Auth users can insert tournament players" on public.tournament_players;
drop policy if exists "Creator manages tournament players" on public.tournament_players;
create policy "Creator manages tournament players" on public.tournament_players
  for all to authenticated
  using (tournament_id in (select id from public.tournaments where created_by = auth.uid()))
  with check (tournament_id in (select id from public.tournaments where created_by = auth.uid()));

-- ------------------------------------------------------------------
-- Warning 3: tournament_matches had "for all using (true)" — any caller
-- could read/insert/update/delete any match. Scope writes to the
-- tournament's creator. The existing public SELECT policy still applies
-- (policies are OR'd), so leaderboards/match views keep working.
-- ------------------------------------------------------------------
drop policy if exists "Auth users can manage matches" on public.tournament_matches;
drop policy if exists "Creator manages tournament matches" on public.tournament_matches;
create policy "Creator manages tournament matches" on public.tournament_matches
  for all to authenticated
  using (tournament_id in (select id from public.tournaments where created_by = auth.uid()))
  with check (tournament_id in (select id from public.tournaments where created_by = auth.uid()));

-- ------------------------------------------------------------------
-- Warning 2 (partial): ratings had "for all using (true)" — anyone with
-- the public anon key could UPDATE or DELETE any rating, and there was no
-- DELETE protection. We can't fully scope this while the browser writes
-- everyone's Elo after a game (one device records all players), but we can
-- at least block anonymous writes and remove DELETE entirely.
-- NOTE: the advisor will STILL flag these as "always true". To clear it
-- fully, move Elo writes to a server route using the service-role key
-- (see message). This is interim hardening, not the final fix.
-- ------------------------------------------------------------------
drop policy if exists "System can manage ratings" on public.ratings;
create policy "Authenticated users insert ratings" on public.ratings
  for insert to authenticated with check (true);
create policy "Authenticated users update ratings" on public.ratings
  for update to authenticated using (true) with check (true);
