import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGame, GAMES } from '@/lib/games'
import { getRules } from '@/lib/rules'
import { createClient } from '@/lib/supabase/server'
import { getServerT, getLocale } from '@/lib/i18n-server'
import StartGameButton from './StartGameButton'
import RulesAccordion from './RulesAccordion'
import PageBanner from '@/components/PageBanner'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params
  const game = getGame(slug)
  if (!game) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { t } = await getServerT()
  const locale = await getLocale()

  // Fetch average rating and leaderboard
  const [{ data: ratingsData }, { data: leaderboard }] = await Promise.all([
    supabase.from('game_ratings').select('rating').eq('game_id', game.id),
    supabase
      .from('ratings')
      .select('rating, games_played, wins, profile_id, guest_player_id, profiles(display_name), guest_players(name)')
      .eq('game_id', game.id)
      .order('rating', { ascending: false })
      .limit(10),
  ])

  const avgRating = ratingsData?.length
    ? (ratingsData.reduce((s, r) => s + r.rating, 0) / ratingsData.length).toFixed(1)
    : null

  const rules = getRules(game.id, locale)

  // Related games (same category, different game)
  const related = GAMES.filter(g => g.active && g.category === game.category && g.id !== game.id).slice(0, 3)

  return (
    <div>
      <PageBanner title={`${game.icon} ${game.name}`} subtitle={`${game.min_players}–${game.max_players} ${t.game.players} · ${game.category}`} />
      <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/games" className="hover:text-gray-600">{t.nav.games}</Link>
        <span>/</span>
        <span className="text-gray-700">{game.name}</span>
      </nav>

      {/* Hero */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="text-5xl">{game.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-black text-gray-900">{game.name}</h1>
              {game.name_alt && <span className="text-gray-400 text-sm">{game.name_alt}</span>}
              {!game.active && (
                <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">{t.games.comingSoon}</span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{t.gameDesc[game.id] ?? game.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span>👥 {game.min_players}–{game.max_players} {t.game.players}</span>
              <span className="capitalize">📂 {game.category}</span>
              {avgRating && <span>⭐ {avgRating} / 5 ({ratingsData?.length} ratings)</span>}
              <span>{game.higher_is_better ? t.game.higherIsBetter : t.game.lowerIsBetter}</span>
            </div>
          </div>
        </div>

        {game.active && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <StartGameButton game={game} user={user} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Rules */}
          {rules && <RulesAccordion rules={rules} labels={{ badge: t.game.rulesBadge, quickStart: t.game.quickStart, fullRules: t.game.fullRules, show: t.game.showFullRules, hide: t.game.hideFullRules }} />}
        </div>

        <div className="space-y-6">
          {/* Leaderboard */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-bold text-gray-900 mb-4">{t.game.globalLeaderboard}</h2>
            {leaderboard && leaderboard.length > 0 ? (
              <ol className="space-y-2">
                {leaderboard.map((entry, i) => {
                  const profilesArr = entry.profiles as unknown as { display_name: string }[] | null
                  const guestsArr = entry.guest_players as unknown as { name: string }[] | null
                  const name = (Array.isArray(profilesArr) ? profilesArr[0] : profilesArr)?.display_name
                    ?? (Array.isArray(guestsArr) ? guestsArr[0] : guestsArr)?.name
                    ?? 'Unknown'
                  return (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-5 text-gray-400 font-medium text-right shrink-0">{i + 1}.</span>
                      <span className="flex-1 font-medium text-gray-800 truncate">{name}</span>
                      <span className="font-bold text-indigo-600">{entry.rating}</span>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="text-sm text-gray-400">{t.game.noRatings}</p>
            )}
          </div>

          {/* You might also like */}
          {related.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="font-bold text-gray-900 mb-4">{t.game.youMightAlsoLike}</h2>
              <div className="space-y-3">
                {related.map(g => (
                  <Link key={g.id} href={`/games/${g.id}`} className="flex items-center gap-3 hover:text-indigo-600 transition-colors">
                    <span className="text-xl">{g.icon}</span>
                    <span className="text-sm font-medium text-gray-800 hover:text-indigo-600">{g.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
