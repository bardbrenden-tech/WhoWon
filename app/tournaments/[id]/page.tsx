import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGame } from '@/lib/games'
import { getServerT } from '@/lib/i18n-server'
import PageBanner from '@/components/PageBanner'
import TournamentView from './TournamentView'
import type { TournamentPlayer, TournamentMatch } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select(`
      id, game_id, status, created_by, created_at,
      tournament_players ( id, tournament_id, display_name, seed, profile_id, guest_player_id ),
      tournament_matches ( id, round, match_index, player1_id, player2_id, winner_id, score, status )
    `)
    .eq('id', id)
    .single()

  if (!tournament) notFound()

  const game = getGame(tournament.game_id)
  const { data: { user } } = await supabase.auth.getUser()
  const { t } = await getServerT()

  const { data: challengeGame } = await supabase
    .from('challenge_games')
    .select('challenge_id, challenges(name)')
    .eq('tournament_id', id)
    .maybeSingle()

  return (
    <div>
      <PageBanner
        title={`🏆 ${game?.name ?? tournament.game_id}`}
        subtitle={`${tournament.tournament_players.length} ${t.tournament.players}`}
      />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          {challengeGame ? (
            <>
              <Link href="/challenges" className="hover:text-gray-600">{t.nav.challenges}</Link>
              <span>/</span>
              <Link href={`/challenges/${challengeGame.challenge_id}`} className="hover:text-gray-600">
                {(challengeGame.challenges as unknown as { name: string } | null)?.name ?? t.challenge.myChallenges}
              </Link>
              <span>/</span>
              <span className="text-gray-700">{game?.name ?? tournament.game_id}</span>
            </>
          ) : (
            <>
              <Link href="/games" className="hover:text-gray-600">{t.nav.games}</Link>
              <span>/</span>
              {game && <Link href={`/games/${game.id}`} className="hover:text-gray-600">{game.name}</Link>}
              <span>/</span>
              <span className="text-gray-700">{t.tournament.bracket}</span>
            </>
          )}
        </nav>
        {challengeGame && (
          <Link
            href={`/challenges/${challengeGame.challenge_id}`}
            className="inline-block text-sm text-indigo-600 font-medium mb-4 hover:text-indigo-800"
          >
            {t.challenge.backToChallenge}
          </Link>
        )}

        <TournamentView
          tournament={tournament as unknown as Parameters<typeof TournamentView>[0]['tournament']}
          userId={user?.id ?? null}
        />
      </div>
    </div>
  )
}
