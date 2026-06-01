function kFactor(gamesPlayed: number): number {
  return gamesPlayed < 30 ? 32 : 16
}

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

export interface EloPlayer {
  id: string
  rating: number
  gamesPlayed: number
  rank: number  // 1 = best/winner
}

export interface EloResult {
  id: string
  oldRating: number
  newRating: number
  change: number
}

export function calculateElo(players: EloPlayer[]): EloResult[] {
  const n = players.length

  // Solo game: no meaningful matchup, return ratings unchanged
  if (n <= 1) {
    return players.map(p => ({ id: p.id, oldRating: p.rating, newRating: p.rating, change: 0 }))
  }

  const changes = new Array(n).fill(0)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const expected = expectedScore(players[i].rating, players[j].rating)
      // rank 1 = best, so lower rank = won
      const actual = players[i].rank < players[j].rank ? 1 : players[i].rank === players[j].rank ? 0.5 : 0
      const K = kFactor(players[i].gamesPlayed)
      changes[i] += K * (actual - expected)
    }
  }

  return players.map((p, i) => {
    const change = Math.round(changes[i] / (n - 1))
    return {
      id: p.id,
      oldRating: p.rating,
      newRating: Math.max(100, p.rating + change),
      change,
    }
  })
}
