'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'

interface HeartsState { total: number; rounds: number[] }

export default function Hearts({ players, onScoreUpdate, onComplete }: GameComponentProps) {
  const [state, setState] = useState<Record<string, HeartsState>>(() =>
    Object.fromEntries(players.map(p => {
      const saved = p.score_data as Partial<HeartsState>
      return [p.id, { total: saved.total ?? 0, rounds: saved.rounds ?? [] }]
    }))
  )
  const [inputs, setInputs] = useState<Record<string, string>>(Object.fromEntries(players.map(p => [p.id, ''])))
  const [error, setError] = useState('')
  const [moonShooter, setMoonShooter] = useState<string | null>(null)

  const GAME_OVER_SCORE = 100

  function submitRound() {
    // Validate: either shoot the moon, or all hearts distributed = 26 total
    if (moonShooter) {
      setState(prev => {
        const next = { ...prev }
        players.forEach(p => {
          if (p.id !== moonShooter) {
            next[p.id] = { total: prev[p.id].total + 26, rounds: [...prev[p.id].rounds, 26] }
            onScoreUpdate(p.id, next[p.id] as unknown as Record<string, unknown>)
          } else {
            next[p.id] = { ...prev[p.id], rounds: [...prev[p.id].rounds, 0] }
            onScoreUpdate(p.id, next[p.id] as unknown as Record<string, unknown>)
          }
        })
        return next
      })
      setMoonShooter(null)
      setInputs(Object.fromEntries(players.map(p => [p.id, ''])))
      setError('')
      return
    }

    const vals = players.map(p => parseInt(inputs[p.id] || '0'))
    if (vals.some(v => isNaN(v) || v < 0)) { setError('Enter valid scores for all players'); return }
    const total = vals.reduce((a, b) => a + b, 0)
    if (total !== 26) { setError(`Total must be 26 (hearts: 13 pts, Queen of Spades: 13 pts). Currently: ${total}`); return }
    setError('')

    setState(prev => {
      const next = { ...prev }
      players.forEach((p, i) => {
        next[p.id] = { total: prev[p.id].total + vals[i], rounds: [...prev[p.id].rounds, vals[i]] }
        onScoreUpdate(p.id, next[p.id] as unknown as Record<string, unknown>)
      })
      return next
    })
    setInputs(Object.fromEntries(players.map(p => [p.id, ''])))
  }

  const isGameOver = players.some(p => state[p.id].total >= GAME_OVER_SCORE)

  function handleFinish() {
    const results = players.map(p => ({ id: p.id, finalScore: state[p.id].total, rank: 0 }))
    results.sort((a, b) => a.finalScore - b.finalScore) // lower is better
    results.forEach((r, i) => { r.rank = i + 1 })
    onComplete(results)
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* Scoreboard */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 3)}, 1fr)` }}>
        {players.map(p => (
          <div key={p.id} className={`bg-white border rounded-xl p-3 text-center ${state[p.id].total >= GAME_OVER_SCORE ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <p className="text-xs font-medium text-gray-500 truncate mb-1">{p.display_name}</p>
            <p className={`text-3xl font-black ${state[p.id].total >= GAME_OVER_SCORE ? 'text-red-600' : 'text-gray-900'}`}>{state[p.id].total}</p>
            <p className="text-xs text-gray-400">{state[p.id].rounds.length} rounds</p>
          </div>
        ))}
      </div>

      {/* Round input */}
      {!isGameOver && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Round {(state[players[0].id].rounds.length) + 1} scores</h3>

          {/* Shoot the moon */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Shoot the moon?</p>
            <div className="flex flex-wrap gap-2">
              {players.map(p => (
                <button
                  key={p.id}
                  onClick={() => setMoonShooter(moonShooter === p.id ? null : p.id)}
                  className={`text-sm px-3 py-1 rounded-full border transition-colors ${moonShooter === p.id ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}`}
                >
                  🌙 {p.display_name}
                </button>
              ))}
            </div>
          </div>

          {!moonShooter && (
            <div className="space-y-2 mb-3">
              {players.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 w-24 truncate">{p.display_name}</label>
                  <input
                    type="number" min={0} max={26} value={inputs[p.id]}
                    onChange={e => setInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          {moonShooter && <p className="text-sm text-indigo-600 mb-3">🌙 {players.find(p=>p.id===moonShooter)?.display_name} shot the moon — everyone else gets 26 pts</p>}

          <button onClick={submitRound} className="w-full bg-indigo-600 text-white py-2.5 font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Add Round
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">Hearts = 1pt each, Queen of Spades = 13pts, total must be 26</p>
        </div>
      )}

      {isGameOver && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-center">
          <p className="font-bold text-amber-800">Game over! Someone reached {GAME_OVER_SCORE}.</p>
          <p className="text-sm text-amber-600 mt-1">Lowest score wins.</p>
        </div>
      )}

      <button
        onClick={() => { if (!isGameOver && !confirm('Game not finished — complete anyway?')) return; handleFinish() }}
        className="w-full bg-indigo-600 text-white py-3 font-bold rounded-xl hover:bg-indigo-700 transition-colors"
      >
        {isGameOver ? 'Complete Game' : 'Finish Early'}
      </button>
    </div>
  )
}
