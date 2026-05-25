import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServerT } from '@/lib/i18n-server'
import { getGame } from '@/lib/games'
import { computeStandings } from '@/lib/challenge'
import PageBanner from '@/components/PageBanner'
import ChallengeView from './ChallengeView'
import type { ChallengePlayer, ChallengeGame, TournamentMatch, TournamentPlayer } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ChallengePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('challenges')
    .select(`
      id, name, status, created_by, created_at,
      challenge_players ( id, display_name, profile_id, guest_player_id ),
      challenge_games (
        id, game_id, order_index, tournament_id,
        tournaments (
          id, status,
          tournament_players ( id, challenge_player_id, display_name, seed, profile_id, guest_player_id ),
          tournament_matches ( id, round, match_index, player1_id, player2_id, winner_id, score, status )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!raw) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const { t } = await getServerT()

  // Normalise types from Supabase's inferred structure
  const challenge = raw as unknown as {
    id: string
    name: string
    status: string
    created_by: string
    challenge_players: ChallengePlayer[]
    challenge_games: Array<ChallengeGame & {
      tournaments: {
        id: string
        status: string
        tournament_players: TournamentPlayer[]
        tournament_matches: TournamentMatch[]
      } | null
    }>
  }

  const sortedGames = [...challenge.challenge_games].sort((a, b) => a.order_index - b.order_index)

  const tournaments = sortedGames
    .filter(cg => cg.tournaments !== null)
    .map(cg => ({
      id: cg.tournaments!.id,
      status: cg.tournaments!.status,
      tournament_players: cg.tournaments!.tournament_players,
      tournament_matches: cg.tournaments!.tournament_matches,
    }))

  const standings = computeStandings(challenge.challenge_players, sortedGames, tournaments)

  const gameNames = Object.fromEntries(
    sortedGames.map(cg => [cg.game_id, getGame(cg.game_id)])
  )

  return (
    <div>
      <PageBanner
        title={`🎯 ${challenge.name}`}
        subtitle={`${sortedGames.length} ${t.challenge.pickGames.toLowerCase()} · ${challenge.challenge_players.length} ${t.tournament.players}`}
      />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ChallengeView
          challenge={challenge}
          sortedGames={sortedGames}
          standings={standings}
          gameNames={gameNames}
          userId={user?.id ?? null}
        />
      </div>
    </div>
  )
}
