'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteChallenge(challengeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, created_by')
    .eq('id', challengeId)
    .eq('created_by', user.id)
    .single()
  if (!challenge) throw new Error('Not found or not authorized')

  // Collect tournament IDs before deleting anything.
  const { data: games } = await supabase
    .from('challenge_games')
    .select('tournament_id')
    .eq('challenge_id', challengeId)
  const tournamentIds = (games ?? []).map(g => g.tournament_id).filter(Boolean) as string[]

  // Deletion order matters — there's a circular RESTRICT-FK situation:
  //   challenge_games.tournament_id   -> tournaments        (RESTRICT)
  //   tournament_players.challenge_player_id -> challenge_players (RESTRICT)
  // So we can't just delete the challenge (its cascade to challenge_players is
  // blocked by tournament_players) nor the tournaments first (blocked by
  // challenge_games). Delete in dependency order instead, and surface errors —
  // previously the result was ignored, so failures looked like success.

  // 1) challenge_games — clears the RESTRICT reference to tournaments.
  const { error: gamesErr } = await supabase
    .from('challenge_games').delete().eq('challenge_id', challengeId)
  if (gamesErr) throw new Error(gamesErr.message)

  // 2) tournaments — cascades tournament_players (which reference
  //    challenge_players) and tournament_matches.
  if (tournamentIds.length > 0) {
    const { error: tErr } = await supabase
      .from('tournaments').delete().in('id', tournamentIds)
    if (tErr) throw new Error(tErr.message)
  }

  // 3) challenge — now cascades challenge_players safely.
  const { error: cErr } = await supabase
    .from('challenges').delete().eq('id', challengeId)
  if (cErr) throw new Error(cErr.message)

  revalidatePath('/challenges')
}
