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

  // Collect tournament IDs before cascade-deleting challenge_games
  const { data: games } = await supabase
    .from('challenge_games')
    .select('tournament_id')
    .eq('challenge_id', challengeId)

  // Delete challenge (cascades challenge_games + challenge_players)
  await supabase.from('challenges').delete().eq('id', challengeId)

  // Delete the linked tournaments (cascades tournament_players + tournament_matches)
  const tournamentIds = (games ?? []).map(g => g.tournament_id).filter(Boolean) as string[]
  if (tournamentIds.length > 0) {
    await supabase.from('tournaments').delete().in('id', tournamentIds)
  }

  revalidatePath('/challenges')
}
