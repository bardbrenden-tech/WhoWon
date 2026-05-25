'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'

interface DartsState { score: number; history: number[]; finished: boolean }

export default function Darts501({ players, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const [state, setState] = useState<Record<string, DartsState>>(() =>
    Object.fromEntries(players.map(p => {
      const saved = p.score_data as Partial<DartsState>
      return [p.id, { score: saved.score ?? 501, history: saved.history ?? [], finished: saved.finished ?? false }]
    }))
  )
  const [currentTurnInput, setCurrentTurnInput] = useState('')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [error, setError] = useState('')

  const currentPlayer = players[currentIdx % players.length]
  const playerState = state[currentPlayer.id]

  function submitTurn() {
    const thrown = parseInt(currentTurnInput)
    if (isNaN(thrown) || thrown < 0 || thrown > 180) { setError('Enter a score between 0 and 180'); return }
    const newScore = playerState.score - thrown
    if (newScore < 0 || newScore === 1) { setError('Bust! Score stays the same.'); return }
    setError('')

    const newState = {
      ...playerState,
      score: newScore,
      history: [...playerState.history, thrown],
      finished: newScore === 0,
    }

    setState(prev => {
      const next = { ...prev, [currentPlayer.id]: newState }
      onScoreUpdate(currentPlayer.id, next[currentPlayer.id] as unknown as Record<string, unknown>)
      return next
    })
    setCurrentTurnInput('')

    if (newScore === 0) return  // winner found, don't advance

    // Advance to next unfinished player
    let nextIdx = currentIdx + 1
    let tries = 0
    while (tries < players.length) {
      const nextPlayer = players[nextIdx % players.length]
      if (!state[nextPlayer.id]?.finished) break
      nextIdx++
      tries++
    }
    setCurrentIdx(nextIdx)
  }

  const winner = players.find(p => state[p.id]?.finished)
  const allDone = winner !== undefined

  function handleFinish() {
    const results = players.map(p => ({ id: p.id, finalScore: state[p.id]?.score ?? 501, rank: 0 }))
    // lower score = better (closer to 0)
    results.sort((a, b) => a.finalScore - b.finalScore)
    results.forEach((r, i) => { r.rank = i + 1 })
    onComplete(results)
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* Scoreboard */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 4)}, 1fr)` }}>
        {players.map(p => {
          const ps = state[p.id]
          const isCurrent = p.id === currentPlayer.id && !allDone
          return (
            <div key={p.id} className={`bg-white border rounded-xl p-3 text-center transition-all ${isCurrent ? 'border-indigo-400 shadow-md' : 'border-gray-200'} ${ps.finished ? 'bg-green-50 border-green-300' : ''}`}>
              <p className="text-xs font-medium text-gray-500 truncate mb-1">{p.display_name}</p>
              <p className={`text-3xl font-black ${ps.finished ? 'text-green-600' : isCurrent ? 'text-indigo-600' : 'text-gray-900'}`}>
                {ps.finished ? '✓' : ps.score}
              </p>
              {isCurrent && !ps.finished && <p className="text-xs text-indigo-400 mt-0.5">throwing</p>}
            </div>
          )
        })}
      </div>

      {/* Winner */}
      {allDone ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-4">
          <p className="text-2xl mb-1">🎯</p>
          <p className="font-bold text-green-800">{winner.display_name} wins!</p>
        </div>
      ) : (
        /* Input */
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {currentPlayer.display_name} — remaining: <span className="text-indigo-600">{playerState.score}</span>
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="number" min={0} max={180} value={currentTurnInput}
              onChange={e => setCurrentTurnInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitTurn()}
              placeholder="Score this turn..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button onClick={submitTurn} className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
              OK
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-xs text-gray-400 mt-2">Enter the total score for this turn (0–180). Must finish on a double.</p>
        </div>
      )}

      {/* History */}
      <div className="space-y-2 mb-4">
        {players.filter(p => state[p.id]?.history.length > 0).map(p => (
          <div key={p.id} className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs font-medium text-gray-500 mb-1">{p.display_name}</p>
            <div className="flex flex-wrap gap-1.5">
              {state[p.id].history.map((h, i) => (
                <span key={i} className="bg-white border border-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">{h}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { if (!allDone) { if (confirm('Abandon game? No ratings will change.')) onAbandon(); return } handleFinish() }}
        className="w-full bg-indigo-600 text-white py-3 font-bold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        {allDone ? 'Complete Game' : 'Finish Early'}
      </button>
    </div>
  )
}
