import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getActiveGames, getGame } from '@/lib/games'
import Link from 'next/link'
import PageBanner from '@/components/PageBanner'
import { getServerT } from '@/lib/i18n-server'

export const metadata: Metadata = {
  title: 'Global leaderboard — Elo rankings for every game | Who Won?',
  description: 'See global Elo rankings across every game on Who Won? — find out who really won.',
  alternates: { canonical: '/leaderboard' },
  openGraph: {
    title: 'Global leaderboard — Elo rankings for every game | Who Won?',
    description: 'See global Elo rankings across every game on Who Won?.',
    url: '/leaderboard',
    siteName: 'Who Won?',
    type: 'website',
  },
}

interface Props {
  searchParams: Promise<{ game?: string }>
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const { game: gameId } = await searchParams
  const { t } = await getServerT()
  const activeGames = getActiveGames()
  const selectedGame = gameId ? getGame(gameId) : activeGames[0]

  const supabase = await createClient()
  const { data: leaderboard } = await supabase
    .from('ratings')
    .select('rating, games_played, wins, profile_id, guest_player_id, profiles(display_name), guest_players(name)')
    .eq('game_id', selectedGame?.id ?? '')
    .order('rating', { ascending: false })
    .limit(100)

  return (
    <div>
      <PageBanner title={t.leaderboard.title} subtitle={t.leaderboard.bannerSubtitle} />
      <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Game selector */}
      <div className="flex gap-2 flex-wrap mb-6">
        {activeGames.map(g => (
          <Link
            key={g.id}
            href={`/leaderboard?game=${g.id}`}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selectedGame?.id === g.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {g.icon} {g.name}
          </Link>
        ))}
      </div>

      {selectedGame && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">{selectedGame.icon} {selectedGame.name}</h2>
            <p className="text-xs text-gray-400">{t.leaderboard.sortedByElo}</p>
          </div>

          {leaderboard && leaderboard.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {leaderboard.map((entry, i) => {
                const profilesArr = entry.profiles as unknown as { display_name: string }[] | null
                const guestsArr = entry.guest_players as unknown as { name: string }[] | null
                const name = (Array.isArray(profilesArr) ? profilesArr[0] : profilesArr)?.display_name
                  ?? (Array.isArray(guestsArr) ? guestsArr[0] : guestsArr)?.name
                  ?? 'Unknown'
                const isTop3 = i < 3
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3 ${isTop3 ? 'bg-amber-50/50' : ''}`}>
                    <span className="w-8 text-center font-bold text-gray-400 shrink-0">
                      {isTop3 ? medals[i] : `${i + 1}`}
                    </span>
                    <span className="flex-1 font-semibold text-gray-800 truncate">{name}</span>
                    <div className="text-right shrink-0">
                      <p className="font-black text-indigo-600">{entry.rating}</p>
                      <p className="text-xs text-gray-400">{entry.games_played} {t.game.rounds} · {entry.wins}W</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <p className="text-3xl mb-2">🎮</p>
              <p>{t.leaderboard.noPlayers.split('—')[0]}— <Link href={`/games/${selectedGame.id}`} className="text-indigo-600 hover:underline">{t.leaderboard.noPlayers.split('— ')[1]}</Link></p>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
