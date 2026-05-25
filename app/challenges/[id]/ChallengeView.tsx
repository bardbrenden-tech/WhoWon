'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/components/LanguageProvider'
import { generateRound } from '@/lib/tournament'
import { getPoints } from '@/lib/challenge'
import type { ChallengePlayer, ChallengeGame, TournamentMatch, TournamentPlayer, Standing } from '@/lib/types'
import type { GameMeta } from '@/lib/types'

interface ChallengeData {
  id: string
  name: string
  status: string
  created_by: string
  challenge_players: ChallengePlayer[]
}

interface GameEntry extends ChallengeGame {
  tournaments: {
    id: string
    status: string
    tournament_players: TournamentPlayer[]
    tournament_matches: TournamentMatch[]
  } | null
}

interface Props {
  challenge: ChallengeData
  sortedGames: GameEntry[]
  standings: Standing[]
  gameNames: Record<string, GameMeta | undefined>
  userId: string | null
}

const ORDINALS = ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.']
const MEDAL = ['🥇', '🥈', '🥉']

export default function ChallengeView({ challenge, sortedGames, standings, gameNames, userId }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const tc = t.challenge

  const [starting, setStarting] = useState<string | null>(null)
  const [startingAll, setStartingAll] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const isCreator = userId === challenge.created_by
  const allDone = sortedGames.length > 0 && sortedGames.every(cg => cg.tournaments?.status === 'completed')
  const champion = allDone && standings.length > 0 ? standings[0] : null
  const unstartedGames = sortedGames.filter(cg => !cg.tournaments)

  async function createTournamentForGame(cg: GameEntry): Promise<void> {
    if (!userId) return
    const supabase = createClient()

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert({ game_id: cg.game_id, created_by: userId })
      .select('id').single()
    if (error || !tournament) return

    const shuffled = [...challenge.challenge_players].sort(() => Math.random() - 0.5)
    const playerInserts = shuffled.map((cp, i) => ({
      tournament_id: tournament.id,
      challenge_player_id: cp.id,
      profile_id: cp.profile_id,
      guest_player_id: cp.guest_player_id,
      display_name: cp.display_name,
      seed: i,
    }))
    const { data: tPlayers } = await supabase
      .from('tournament_players')
      .insert(playerInserts)
      .select('id, seed')
    if (!tPlayers) return

    const sorted = tPlayers.sort((a, b) => a.seed - b.seed)
    const round1 = generateRound(sorted, 1).map(m => ({ ...m, tournament_id: tournament.id }))
    await supabase.from('tournament_matches').insert(round1)

    await supabase
      .from('challenge_games')
      .update({ tournament_id: tournament.id })
      .eq('id', cg.id)
  }

  async function startOne(cg: GameEntry) {
    setStarting(cg.id)
    await createTournamentForGame(cg)
    setStarting(null)
    router.refresh()
  }

  async function startAll() {
    setStartingAll(true)
    for (const cg of unstartedGames) {
      await createTournamentForGame(cg)
    }
    setStartingAll(false)
    router.refresh()
  }

  function copyBracketLink(tournamentId: string) {
    const url = `${window.location.origin}/tournaments/${tournamentId}`
    navigator.clipboard.writeText(url)
    setCopied(tournamentId)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-8">
      <Link href="/challenges" className="text-sm text-gray-400 hover:text-gray-600">← {tc.myChallenges}</Link>

      {/* Champion banner */}
      {champion && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-sm text-yellow-700 font-semibold uppercase tracking-wide mb-1">{tc.complete}</p>
          <p className="text-2xl font-black text-gray-900">{champion.displayName}</p>
          <p className="text-sm text-yellow-600 mt-1">{champion.points} {tc.points}</p>
        </div>
      )}

      {/* Games */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">{tc.pickGames}</h2>
          {isCreator && unstartedGames.length > 1 && (
            <button
              onClick={startAll}
              disabled={startingAll}
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {startingAll ? tc.starting : `⚡ ${tc.startAll}`}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sortedGames.map((cg, i) => {
            const game = gameNames[cg.game_id]
            const tourney = cg.tournaments
            const status = !tourney ? 'notStarted' : tourney.status === 'completed' ? 'done' : 'ongoing'

            return (
              <div key={cg.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-sm font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {game?.icon} {game?.name ?? cg.game_id}
                    </p>
                    <p className="text-xs mt-0.5">
                      {status === 'notStarted' && <span className="text-gray-400">{tc.notStarted}</span>}
                      {status === 'ongoing' && <span className="text-indigo-500 font-medium">{tc.ongoing}</span>}
                      {status === 'done' && <span className="text-green-600 font-medium">✓ {tc.done}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {status === 'notStarted' && isCreator && (
                      <button
                        onClick={() => startOne(cg)}
                        disabled={starting === cg.id || startingAll}
                        className="bg-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {starting === cg.id ? tc.starting : tc.startTournament}
                      </button>
                    )}
                    {status !== 'notStarted' && tourney && (
                      <>
                        <button
                          onClick={() => copyBracketLink(tourney.id)}
                          title={tc.copyLink}
                          className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {copied === tourney.id ? '✓' : '🔗'}
                        </button>
                        <Link
                          href={`/tournaments/${tourney.id}`}
                          className="text-sm text-indigo-600 font-medium border border-indigo-200 px-4 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          {tc.viewBracket}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Standings */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">{tc.standings}</h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide"
            style={{ gridTemplateColumns: `auto 1fr repeat(${sortedGames.length}, 2.5rem) 3rem` }}>
            <span>#</span>
            <span>{t.tournament.players}</span>
            {sortedGames.map((cg, i) => (
              <span key={cg.id} className="text-center" title={gameNames[cg.game_id]?.name}>
                {gameNames[cg.game_id]?.icon ?? (i + 1)}
              </span>
            ))}
            <span className="text-right">{tc.points}</span>
          </div>

          {standings.map((s, idx) => (
            <div key={s.challengePlayerId}
              className={`grid gap-2 px-4 py-3 items-center border-b border-gray-50 last:border-0 ${idx === 0 && allDone ? 'bg-yellow-50' : ''}`}
              style={{ gridTemplateColumns: `auto 1fr repeat(${sortedGames.length}, 2.5rem) 3rem` }}>
              <span className="text-sm w-6 text-center">
                {allDone && idx < 3 ? MEDAL[idx] : ORDINALS[idx] ?? `${idx + 1}.`}
              </span>
              <span className="text-sm font-semibold text-gray-900 truncate">{s.displayName}</span>
              {sortedGames.map(cg => {
                const placement = s.placements[cg.game_id]
                return (
                  <span key={cg.id} className="text-center text-xs text-gray-500">
                    {placement ? ORDINALS[placement - 1] ?? `${placement}.` : '–'}
                  </span>
                )
              })}
              <span className="text-right text-sm font-bold text-indigo-600">
                {s.points > 0 ? `${s.points}` : '–'}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          1. = {getPoints(1)} · 2. = {getPoints(2)} · 3/4. = {getPoints(3)} · 5–8. = {getPoints(5)} · øvrige = {getPoints(9)} {tc.points}
        </p>
      </div>
    </div>
  )
}
