import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGame } from '@/lib/games'
import { getServerT } from '@/lib/i18n-server'
import PageBanner from '@/components/PageBanner'
import TournamentView from './TournamentView'

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
      tournament_players ( id, display_name, seed, profile_id, guest_player_id ),
      tournament_matches ( id, round, match_index, player1_id, player2_id, winner_id, score, status )
    `)
    .eq('id', id)
    .single()

  if (!tournament) notFound()

  const game = getGame(tournament.game_id)
  const { data: { user } } = await supabase.auth.getUser()
  const { t } = await getServerT()

  return (
    <div>
      <PageBanner
        title={`🏆 ${game?.name ?? tournament.game_id}`}
        subtitle={`${tournament.tournament_players.length} ${t.tournament.players}`}
      />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/games" className="hover:text-gray-600">{t.nav.games}</Link>
          <span>/</span>
          {game && <Link href={`/games/${game.id}`} className="hover:text-gray-600">{game.name}</Link>}
          <span>/</span>
          <span className="text-gray-700">{t.tournament.bracket}</span>
        </nav>

        <TournamentView
          tournament={tournament as Parameters<typeof TournamentView>[0]['tournament']}
          userId={user?.id ?? null}
        />
      </div>
    </div>
  )
}
