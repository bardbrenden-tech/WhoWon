import Link from 'next/link'
import { GAMES, CATEGORIES } from '@/lib/games'
import type { GameCategory } from '@/lib/types'
import PageBanner from '@/components/PageBanner'
import { getServerT } from '@/lib/i18n-server'

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function GamesPage({ searchParams }: Props) {
  const { category, q } = await searchParams
  const { t } = await getServerT()
  const activeCategory = category as GameCategory | undefined

  const filtered = GAMES.filter(g => {
    if (activeCategory && g.category !== activeCategory) return false
    if (q && !g.name.toLowerCase().includes(q.toLowerCase()) && !(g.name_alt?.toLowerCase().includes(q.toLowerCase()))) return false
    return true
  }).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div>
      <PageBanner title={t.games.title} subtitle={t.games.bannerSubtitle} />
      <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href="/games"
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !activeCategory ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          {t.games.all}
        </Link>
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            href={`/games?category=${cat.id}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 ${
              activeCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {cat.icon} {t.category[cat.id as keyof typeof t.category] ?? cat.label}
          </Link>
        ))}
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(game => (
          <div key={game.id} className="relative">
            {game.active ? (
              <Link
                href={`/games/${game.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <GameCard game={game} soonLabel={t.games.soon} playersLabel={t.game.players} />
              </Link>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-5 opacity-60 cursor-not-allowed">
                <GameCard game={game} comingSoon soonLabel={t.games.soon} playersLabel={t.game.players} />
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No games found. <Link href="/games" className="text-indigo-600 hover:underline">Clear filters</Link></p>
        </div>
      )}
      </div>
    </div>
  )
}

function GameCard({ game, comingSoon, soonLabel, playersLabel }: { game: (typeof GAMES)[0]; comingSoon?: boolean; soonLabel: string; playersLabel: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-3xl">{game.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
            {game.name}
          </h3>
          {comingSoon && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">{soonLabel}</span>
          )}
        </div>
        {game.name_alt && <p className="text-xs text-gray-400 mb-1">{game.name_alt}</p>}
        <p className="text-sm text-gray-500 line-clamp-2">{game.description}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>{game.min_players}–{game.max_players} {playersLabel}</span>
          <span className="capitalize">{game.category}</span>
        </div>
      </div>
    </div>
  )
}
