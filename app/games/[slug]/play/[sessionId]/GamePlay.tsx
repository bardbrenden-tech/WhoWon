'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateElo } from '@/lib/elo'
import type { GameMeta, Session, SessionPlayer, GameComponentProps } from '@/lib/types'

type DynamicGameComponent = React.ComponentType<GameComponentProps>

const Generic = dynamic<GameComponentProps>(() => import('@/components/games/GenericScorecard'))

const GAME_COMPONENTS: Record<string, DynamicGameComponent> = {
  'maxi-yatzy':     dynamic<GameComponentProps>(() => import('@/components/games/MaxiYatzy')),
  'yatzy':          dynamic<GameComponentProps>(() => import('@/components/games/Yatzy')),
  'darts-501':      dynamic<GameComponentProps>(() => import('@/components/games/Darts501')),
  'darts-301':      dynamic<GameComponentProps>(() => import('@/components/games/Darts301')),
  'darts-cricket':  dynamic<GameComponentProps>(() => import('@/components/games/DartsCricket')),
  'hearts':         dynamic<GameComponentProps>(() => import('@/components/games/Hearts')),
  'farkle':         dynamic<GameComponentProps>(() => import('@/components/games/Farkle')),
  // Generic round-by-round scorecard
  'spades': Generic, 'rummy': Generic, 'gin-rummy': Generic, 'canasta': Generic,
  'phase-10': Generic, 'uno': Generic, 'cabo': Generic, 'cribbage': Generic,
  'doppelkopf': Generic, 'skat': Generic, 'catan': Generic, 'ticket-to-ride': Generic,
  'carcassonne': Generic, 'scrabble': Generic, 'backgammon': Generic,
  'sequence': Generic, 'petanque': Generic, 'croquet': Generic, 'bowling': Generic,
  'kubb': Generic, 'molkky': Generic, 'disc-golf': Generic, 'cornhole': Generic,
  'table-tennis': Generic, 'billiards': Generic, 'badminton': Generic, 'foosball': Generic,
}

interface Props {
  game: GameMeta
  session: Session & { session_players: SessionPlayer[] }
  userId: string
}

interface FinalResult { id: string; finalScore: number; rank: number }

export default function GamePlay({ game, session, userId }: Props) {
  const router = useRouter()
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState<FinalResult[]>([])
  const [eloChanges, setEloChanges] = useState<Record<string, number>>({})

  const GameComponent = GAME_COMPONENTS[game.id]
  if (!GameComponent) return <p className="p-8 text-center text-gray-500">Game not yet implemented.</p>

  async function handleScoreUpdate(playerId: string, scoreData: Record<string, unknown>) {
    const supabase = createClient()
    await supabase.from('session_players').update({ score_data: scoreData }).eq('id', playerId)
  }

  async function handleAbandon() {
    const supabase = createClient()
    await supabase.from('sessions').update({ status: 'abandoned' }).eq('id', session.id)
    router.push(`/games/${game.id}`)
  }

  async function handleComplete(finalResults: FinalResult[]) {
    const supabase = createClient()

    // Fetch current ratings for all players
    const playerRatings: Record<string, { rating: number; gamesPlayed: number }> = {}
    for (const sp of session.session_players) {
      const col = sp.profile_id ? 'profile_id' : 'guest_player_id'
      const val = sp.profile_id ?? sp.guest_player_id
      const { data } = await supabase.from('ratings').select('rating, games_played').eq('game_id', game.id).eq(col, val).single()
      playerRatings[sp.id] = { rating: data?.rating ?? 1000, gamesPlayed: data?.games_played ?? 0 }
    }

    // Calculate Elo
    const eloInputs = session.session_players.map(sp => {
      const result = finalResults.find(r => r.id === sp.id)
      return { id: sp.id, rating: playerRatings[sp.id].rating, gamesPlayed: playerRatings[sp.id].gamesPlayed, rank: result?.rank ?? session.session_players.length }
    })
    const eloResults = calculateElo(eloInputs)
    const changes: Record<string, number> = {}

    // Update session_players + ratings
    for (const r of eloResults) {
      const sp = session.session_players.find(p => p.id === r.id)!
      const result = finalResults.find(f => f.id === r.id)!
      changes[r.id] = r.change

      await supabase.from('session_players').update({
        final_score: result.finalScore,
        rank: result.rank,
        elo_before: r.oldRating,
        elo_after: r.newRating,
      }).eq('id', r.id)

      const col = sp.profile_id ? 'profile_id' : 'guest_player_id'
      const val = sp.profile_id ?? sp.guest_player_id
      const isWin = result.rank === 1 ? 1 : 0

      await supabase.from('ratings').upsert({
        profile_id: sp.profile_id,
        guest_player_id: sp.guest_player_id,
        game_id: game.id,
        rating: r.newRating,
        games_played: (playerRatings[r.id].gamesPlayed ?? 0) + 1,
        wins: (playerRatings[r.id].gamesPlayed === 0 ? 0 : undefined) ?? isWin,
        updated_at: new Date().toISOString(),
      }, { onConflict: col + ',game_id', ignoreDuplicates: false })
    }

    // Mark session completed
    await supabase.from('sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', session.id)

    setResults(finalResults)
    setEloChanges(changes)
    setCompleted(true)
  }

  if (completed) {
    const sorted = [...results].sort((a, b) => {
      if (game.higher_is_better) return b.finalScore - a.finalScore
      return a.finalScore - b.finalScore
    })

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🏆</div>
            <h1 className="text-2xl font-black text-gray-900">Game Over!</h1>
            <p className="text-gray-500 text-sm">{game.name}</p>
          </div>
          <div className="space-y-3 mb-6">
            {sorted.map((r, i) => {
              const sp = session.session_players.find(p => p.id === r.id)!
              const elo = eloChanges[r.id] ?? 0
              return (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border ${i === 0 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
                  <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{sp.display_name}</p>
                    <p className="text-sm text-gray-500">Score: {r.finalScore}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${elo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {elo >= 0 ? '+' : ''}{elo}
                    </p>
                    <p className="text-xs text-gray-400">rating</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/games/${game.id}`)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Back to game
            </button>
            <button onClick={() => router.push('/')} className="flex-1 bg-indigo-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
              Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{game.name}</p>
          <p className="text-sm font-semibold text-gray-700">{session.session_players.map(p => p.display_name).join(' · ')}</p>
        </div>
        <button
          onClick={() => { if (confirm('Abandon this game?')) router.push(`/games/${game.id}`) }}
          className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg"
        >
          Quit
        </button>
      </div>
      <GameComponent
        players={session.session_players}
        options={session.options ?? {}}
        onScoreUpdate={handleScoreUpdate}
        onComplete={handleComplete}
        onAbandon={handleAbandon}
      />
    </div>
  )
}
