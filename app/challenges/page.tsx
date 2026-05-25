import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServerT } from '@/lib/i18n-server'
import PageBanner from '@/components/PageBanner'
import DeleteChallengeButton from './DeleteChallengeButton'

export default async function ChallengesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { t } = await getServerT()
  const tc = t.challenge

  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, name, status, created_at, challenge_games(id, tournament_id, tournaments(status)), challenge_players(id)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageBanner title={`🎯 ${tc.myChallenges}`} subtitle="" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">{tc.myChallenges}</h2>
          <Link
            href="/challenges/new"
            className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            + {tc.newChallenge}
          </Link>
        </div>

        {!challenges || challenges.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-sm">{tc.noChallenge}</p>
            <Link
              href="/challenges/new"
              className="mt-4 inline-block bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {tc.newChallenge}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map(c => {
              const games = Array.isArray(c.challenge_games) ? c.challenge_games : []
              const gameCount   = games.length
              const playerCount = Array.isArray(c.challenge_players) ? c.challenge_players.length : 0

              // Derive real status: all started games completed = done
              const startedGames = games.filter((g: { tournament_id: string | null; tournaments: { status: string } | null }) => g.tournament_id)
              const isCompleted  = c.status === 'completed' ||
                (gameCount > 0 && startedGames.length === gameCount &&
                  startedGames.every((g: { tournaments: { status: string } | null }) => g.tournaments?.status === 'completed'))

              return (
                <div key={c.id} className="relative bg-white border border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-sm transition-all group">
                  <Link href={`/challenges/${c.id}`} className="block p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{c.name}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {gameCount} {tc.pickGames.toLowerCase()} · {playerCount} {t.tournament.players}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {isCompleted ? tc.done : tc.ongoing}
                      </span>
                    </div>
                  </Link>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteChallengeButton challengeId={c.id} challengeName={c.name} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
