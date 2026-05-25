export interface MatchInsert {
  round: number
  match_index: number
  player1_id: string
  player2_id: string | null
  winner_id?: string
  status: 'pending' | 'bye'
}

export function generateRound(players: { id: string }[], round: number): MatchInsert[] {
  const matches: MatchInsert[] = []
  for (let i = 0; i < players.length; i += 2) {
    if (i + 1 < players.length) {
      matches.push({ round, match_index: i / 2, player1_id: players[i].id, player2_id: players[i + 1].id, status: 'pending' })
    } else {
      matches.push({ round, match_index: i / 2, player1_id: players[i].id, player2_id: null, winner_id: players[i].id, status: 'bye' })
    }
  }
  return matches
}

export function getRoundLabel(round: number, maxRound: number): string {
  if (round === maxRound) return 'Finale'
  if (round === maxRound - 1) return 'Semifinale'
  if (round === maxRound - 2) return 'Kvartfinale'
  return `Runde ${round}`
}

export function estimateTotalRounds(playerCount: number): number {
  return Math.ceil(Math.log2(playerCount))
}
