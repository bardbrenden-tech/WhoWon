import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { GAMES, CATEGORIES } from '@/lib/games'
import { getServerT } from '@/lib/i18n-server'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const { t } = await getServerT()
  const activeGames = GAMES.filter(g => g.active)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[520px] flex items-center justify-center py-24 px-4 text-center">
        <Image
          src="/images/Background.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <Image src="/images/Logo.png" alt="Who Won?" width={260} height={160} className="drop-shadow-2xl" priority />
          </div>
          <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/games"
              className="font-bold px-8 py-3.5 rounded-xl transition-colors text-lg shadow-lg"
              style={{ background: 'linear-gradient(180deg, #FFE566 0%, #F5C518 45%, #CC7A00 100%)', color: '#1a1a1a' }}
            >
              {t.hero.browseGames}
            </Link>
            <Link
              href="/login"
              className="font-bold px-8 py-3.5 rounded-xl transition-colors text-lg shadow-lg"
              style={{ background: 'linear-gradient(180deg, #FFE566 0%, #F5C518 45%, #CC7A00 100%)', color: '#1a1a1a' }}
            >
              {t.hero.signInFree}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.home.browseByCategory}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/games?category=${cat.id}`}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                {t.category[cat.id as keyof typeof t.category] ?? cat.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Active Games */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.home.playNow}</h2>
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
                  <p className="text-sm text-gray-500 line-clamp-2">{t.gameDesc[game.id] ?? game.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{game.min_players}–{game.max_players} {t.game.players}</span>
                    <span>{t.category[game.category as keyof typeof t.category] ?? game.category}</span>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-12">{t.home.howItWorks}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: '👥', title: t.home.step1Title, desc: t.home.step1Desc },
              { icon: '🎮', title: t.home.step2Title, desc: t.home.step2Desc },
              { icon: '📊', title: t.home.step3Title, desc: t.home.step3Desc },
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
        <div className="flex justify-center mb-3">
          <Image src="/images/Logo.png" alt="Who Won?" width={80} height={52} className="rounded-md opacity-90" />
        </div>
        <p>{t.home.footer}</p>
      </footer>
    </div>
  )
}
