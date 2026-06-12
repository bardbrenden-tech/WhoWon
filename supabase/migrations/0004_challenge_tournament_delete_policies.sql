-- Allow the creator to DELETE their own challenges and tournaments.
--
-- Bug: deleting a challenge (the "Turnering" cards under /challenges) appeared
-- to do nothing — the card stayed in the list after deletion. Root cause:
-- both `challenges` and `tournaments` have RLS enabled with SELECT/INSERT/
-- UPDATE policies but NO DELETE policy. Postgres RLS denies any command that
-- has no matching permissive policy, so `delete()` from the browser silently
-- affected 0 rows (no error raised). The ownership SELECT in deleteChallenge()
-- succeeded, but the actual DELETE was blocked.
--
-- Child rows (challenge_players, challenge_games, tournament_players,
-- tournament_matches) all reference their parent with `on delete cascade`, so
-- once the parent delete is permitted they are removed automatically at the DB
-- level (FK cascade is not subject to the child tables' RLS).

drop policy if exists "Creator deletes challenges" on public.challenges;
create policy "Creator deletes challenges" on public.challenges
  for delete to authenticated using (auth.uid() = created_by);

drop policy if exists "Creator deletes tournament" on public.tournaments;
create policy "Creator deletes tournament" on public.tournaments
  for delete to authenticated using (auth.uid() = created_by);

-- Verification: each table should now have a DELETE policy scoped to the creator.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('challenges', 'tournaments')
  and cmd = 'DELETE';
