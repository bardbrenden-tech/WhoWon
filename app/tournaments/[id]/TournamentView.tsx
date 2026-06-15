'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/components/LanguageProvider'
import { generateRound, getRoundLabel, estimateTotalRounds } from '@/lib/tournament'
import type { TournamentPlayer, TournamentMatch } from '@/lib/types'

interface TournamentData {
  id: string
  status: string
  // Unused in the view itself; optional so this component can be embedded with
  // the challenge page's already-loaded tournament data (which omits them).
  game_id?: string
  created_by?: string
  tournament_players: TournamentPlayer[]
  tournament_matches: TournamentMatch[]
}

interface Props {
  tournament: TournamentData
  userId: string | null
}

export default function TournamentView({ tournament, userId }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const tt = t.tournament

  // Local, optimistic copies of the mutable tournament state. Picking a winner
  // updates these instantly and the DB write happens in the background, so the
  // UI never waits on a network round-trip or a full server refetch.
  const [matches, setMatches] = useState<TournamentMatch[]>(tournament.tournament_matches)
  const [status, setStatus] = useState(tournament.status)

  const [pickingMatch, setPickingMatch] = useState<string | null>(null)
  const [score, setScore] = useState('')
  // Guards against a double-click registering the same match twice (which would
  // otherwise generate the next round twice with different ids).
  const handled = useRef<Set<string>>(new Set())

  const playerMap = Object.fromEntries(tournament.tournament_players.map(p => [p.id, p]))

  const maxRound = matches.length > 0
    ? Math.max(...matches.map(m => m.round))
    : 1

  const totalRounds = estimateTotalRounds(tournament.tournament_players.length)

  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b)

  const currentRound = rounds.find(r =>
    matches.filter(m => m.round === r).some(m => m.status === 'pending')
  ) ?? maxRound

  const winner = status === 'completed'
    ? matches.find(m =>
        m.round === maxRound &&
        !matches.some(m2 => m2.round > m.round)
      )?.winner_id
    : null

  async function persist(matchId: string, winnerId: string, scoreVal: string, finalize: boolean, nextMatches: TournamentMatch[]) {
    const supabase = createClient()
    const { error } = await supabase
      .from('tournament_matches')
      .update({ winner_id: winnerId, score: scoreVal || null, status: 'completed' })
      .eq('id', matchId)
    // On any failure, fall back to a server refetch so the UI re-syncs to truth.
    if (error) { router.refresh(); return }

    if (finalize) {
      const { error: e2 } = await supabase.from('tournaments').update({ status: 'completed' }).eq('id', tournament.id)
      if (e2) router.refresh()
    } else if (nextMatches.length > 0) {
      const { error: e3 } = await supabase.from('tournament_matches').insert(
        nextMatches.map(m => ({
          id: m.id,
          tournament_id: m.tournament_id,
          round: m.round,
          match_index: m.match_index,
          player1_id: m.player1_id,
          player2_id: m.player2_id,
          winner_id: m.winner_id,
          score: m.score,
          status: m.status,
        }))
      )
      if (e3) router.refresh()
    }
  }

  function setWinner(matchId: string, winnerId: string) {
    if (handled.current.has(matchId)) return
    handled.current.add(matchId)

    const scoreVal = score
    setScore('')
    setPickingMatch(null)

    const updated = matches.map(m =>
      m.id === matchId ? { ...m, winner_id: winnerId, score: scoreVal || null, status: 'completed' as const } : m
    )

    const roundMatches = updated.filter(m => m.round === currentRound)
    const allDone = roundMatches.every(m => m.status === 'completed' || m.status === 'bye')

    let nextMatches: TournamentMatch[] = []
    let newStatus = status
    if (allDone) {
      const winners = roundMatches
        .slice()
        .sort((a, b) => a.match_index - b.match_index)
        .map(m => ({ id: m.winner_id! }))
      if (winners.length === 1) {
        newStatus = 'completed'
      } else {
        nextMatches = generateRound(winners, currentRound + 1).map(m => ({
          id: crypto.randomUUID(),
          tournament_id: tournament.id,
          round: m.round,
          match_index: m.match_index,
          player1_id: m.player1_id,
          player2_id: m.player2_id,
          winner_id: m.winner_id ?? null,
          score: null,
          status: m.status,
        }))
      }
    }

    // Apply optimistically — the bracket updates immediately.
    setMatches([...updated, ...nextMatches])
    if (newStatus !== status) setStatus(newStatus)

    // Persist in the background; we don't await it.
    void persist(matchId, winnerId, scoreVal, newStatus === 'completed', nextMatches)
  }

  return (
    <div className="space-y-6">
      {status === 'completed' && winner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-sm text-yellow-700 font-medium uppercase tracking-wide mb-1">{tt.complete}</p>
          <p className="text-2xl font-black text-gray-900">{playerMap[winner]?.display_name}</p>
        </div>
      )}

      {rounds.map(round => {
        const roundMatches = matches.filter(m => m.round === round).sort((a, b) => a.match_index - b.match_index)
        const isActive = round === currentRound && status === 'active'
        const label = getRoundLabel(round, Math.max(maxRound, totalRounds))

        return (
          <div key={round}>
            <h2 className={`font-bold text-lg mb-3 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
              {label}
              {isActive && <span className="ml-2 text-xs font-normal bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Pågår</span>}
            </h2>

            <div className="space-y-3">
              {roundMatches.map(match => {
                const p1 = match.player1_id ? playerMap[match.player1_id] : null
                const p2 = match.player2_id ? playerMap[match.player2_id] : null
                const w = match.winner_id ? playerMap[match.winner_id] : null
                const isPicking = pickingMatch === match.id
                const isCompleted = match.status === 'completed' || match.status === 'bye'
                const isByeMatch = match.status === 'bye'

                return (
                  <div key={match.id} className={`bg-white border rounded-xl p-4 ${isActive && !isCompleted ? 'border-indigo-200' : 'border-gray-200'}`}>
                    {isByeMatch ? (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">{p1?.display_name}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-auto">{tt.bye}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <PlayerSlot name={p1?.display_name} isWinner={w?.id === p1?.id} isDone={isCompleted} />
                          <span className="text-xs text-gray-400 shrink-0">{tt.vs}</span>
                          <PlayerSlot name={p2?.display_name} isWinner={w?.id === p2?.id} isDone={isCompleted} />
                          {match.score && <span className="text-xs text-gray-400 ml-auto shrink-0">{match.score}</span>}
                        </div>

                        {isActive && !isCompleted && userId && (
                          <>
                            {isPicking ? (
                              <div className="pt-2 border-t border-gray-100 space-y-2">
                                <p className="text-xs text-gray-500 font-medium">{tt.yourTurn}:</p>
                                <div className="flex gap-2">
                                  {[p1, p2].filter(Boolean).map(p => (
                                    <button key={p!.id} onClick={() => setWinner(match.id, p!.id)}
                                      className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-indigo-700">
                                      {p!.display_name}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  type="text"
                                  value={score}
                                  onChange={e => setScore(e.target.value)}
                                  placeholder={tt.score}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                                <button onClick={() => setPickingMatch(null)} className="text-xs text-gray-400 hover:text-gray-600">{tt.cancel}</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setPickingMatch(match.id)}
                                className="w-full mt-1 text-sm text-indigo-600 font-medium border border-indigo-200 rounded-lg py-1.5 hover:bg-indigo-50 transition-colors"
                              >
                                {tt.setWinner}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PlayerSlot({ name, isWinner, isDone }: { name?: string; isWinner: boolean; isDone: boolean }) {
  return (
    <span className={`flex-1 text-sm font-semibold truncate ${
      isDone
        ? isWinner ? 'text-green-700' : 'text-gray-400 line-through'
        : 'text-gray-800'
    }`}>
      {name ?? '—'}
      {isWinner && ' ✓'}
    </span>
  )
}
