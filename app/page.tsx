import Link from 'next/link'
import { GAMES, CATEGORIES } from '@/lib/games'

export default function HomePage() {
  const activeGames = GAMES.filter(g => g.active)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Who Won?
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            The social scoreboard for physical games. No more paper. Track scores, compete with your group, and build your global rating.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/games"
              className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors text-lg"
            >
              Browse Games
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors text-lg"
            >
              Sign in free
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/games?category=${cat.id}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">{cat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Active Games */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Play now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeGames.map(game => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{game.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {game.name}
                    </h3>
                    {game.name_alt && (
                      <span className="text-xs text-gray-400 shrink-0">{game.name_alt}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{game.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{game.min_players}–{game.max_players} players</span>
                    <span className="capitalize">{game.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-gray-200 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: '👥', title: 'Add your players', desc: 'Sign in with Google, then add your friends as players — no accounts needed for them.' },
              { icon: '🎮', title: 'Play with built-in scorecards', desc: 'Built-in scorecards for every game — no more pen and paper.' },
              { icon: '📊', title: 'Track your rating', desc: 'Earn Elo points per game. See how you compare locally and globally.' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p className="font-bold text-white mb-1">Who Won?</p>
        <p>Free forever · who-won.com</p>
      </footer>
    </div>
  )
}
