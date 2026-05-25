import type { TournamentMatch, ChallengePlayer, ChallengeGame, Standing } from './types'

interface TournamentForStandings {
  id: string
  status: string
  tournament_players: Array<{ id: string; challenge_player_id?: string | null }>
  tournament_matches: TournamentMatch[]
}

export function getPoints(placement: number): number {
  if (placement === 1) return 10
  if (placement === 2) return 7
  if (placement <= 4) return 5
  if (placement <= 8) return 3
  return 1
}

export function getPlacementsFromTournament(matches: TournamentMatch[]): Map<string, number> {
  const placements = new Map<string, number>()
  const completed = matches.filter(m => m.status === 'completed')
  if (completed.length === 0) return placements

  const maxRound = Math.max(...completed.map(m => m.round))
  const finals = completed.filter(m => m.round === maxRound)

  for (const m of finals) {
    if (m.winner_id) {
      placements.set(m.winner_id, 1)
      const loser = m.player1_id === m.winner_id ? m.player2_id : m.player1_id
      if (loser) placements.set(loser, 2)
    }
  }

  let nextPlacement = 3
  for (let round = maxRound - 1; round >= 1; round--) {
    const roundMatches = completed.filter(m => m.round === round)
    for (const m of roundMatches) {
      const loser = m.player1_id === m.winner_id ? m.player2_id : m.player1_id
      if (loser && !placements.has(loser)) placements.set(loser, nextPlacement)
    }
    nextPlacement += roundMatches.length
  }

  return placements
}

export function computeStandings(
  challengePlayers: ChallengePlayer[],
  challengeGames: ChallengeGame[],
  tournaments: TournamentForStandings[]
): Standing[] {
  const standings: Standing[] = challengePlayers.map(cp => ({
    challengePlayerId: cp.id,
    displayName: cp.display_name,
    points: 0,
    placements: {},
  }))

  for (const cg of challengeGames) {
    if (!cg.tournament_id) continue
    const t = tournaments.find(t => t.id === cg.tournament_id)
    if (!t || t.status !== 'completed') continue

    const placementMap = getPlacementsFromTournament(t.tournament_matches)

    for (const tp of t.tournament_players) {
      if (!tp.challenge_player_id) continue
      const placement = placementMap.get(tp.id)
      if (placement === undefined) continue

      const s = standings.find(s => s.challengePlayerId === tp.challenge_player_id)
      if (s) {
        s.points += getPoints(placement)
        s.placements[cg.game_id] = placement
      }
    }
  }

  return standings.sort((a, b) => b.points - a.points)
}
