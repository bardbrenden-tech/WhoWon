import type { MetadataRoute } from 'next'
import { GAMES } from '@/lib/games'

const BASE = 'https://who-won.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE,                  priority: 1.0,  changeFrequency: 'weekly'  as const },
    { url: `${BASE}/games`,       priority: 0.9,  changeFrequency: 'weekly'  as const },
    { url: `${BASE}/leaderboard`, priority: 0.7,  changeFrequency: 'daily'   as const },
    { url: `${BASE}/login`,       priority: 0.5,  changeFrequency: 'monthly' as const },
  ]

  const gamePages = GAMES.map(g => ({
    url: `${BASE}/games/${g.id}`,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }))

  return [...staticPages, ...gamePages].map(p => ({
    url: p.url,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))
}
