'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'

interface FarkleState { total: number; rounds: number[]; inFinalRound: boolean; finishedFinalRound: boolean }

const WIN_SCORE = 10000

export default function Farkle({ players, onScoreUpdate, onComplete }: GameComponentProps) {
  const [state, setState] = useState<Record<string, FarkleState>>(() =>
    Object.fromEntries(players.map(p => {
      const saved = p.score_data as Partial<FarkleState>
      return [p.id, { total: saved.total ?? 0, rounds: saved.rounds ?? [], inFinalRound: saved.inFinalRound ?? false, finishedFinalRound: saved.finishedFinalRound ?? false }]
    }))
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [turnInput, setTurnInput] = useState('')
  const [error, setError] = useState('')

  const currentPlayer = players[currentIdx % players.length]
  const playerState = state[currentPlayer.id]

  const triggered = players.some(p => state[p.id].total >= WIN_SCORE)
  const isGameOver = triggered && players.every(p => {
    const firstOver = players.find(q => state[q.id].total >= WIN_SCORE)
    if (!firstOver) return false
    const triggerIdx = players.indexOf(firstOver)
    const pIdx = players.indexOf(p)
    // Everyone after the trigger player (in that final round) must have finished
    return pIdx <= triggerIdx || state[p.id].finishedFinalRound
  })

  function submitTurn() {
    const points = parseInt(turnInput)
    if (isNaN(points) || points < 0) { setError('Enter a valid score (0 for Farkle)'); return }
    if (points > 0 && state[currentPlayer.id].total === 0 && points < 1000) {
      setError('Need at least 1000 points to open your account'); return
    }
    setError('')

    const newTotal = playerState.total + points
    const finishesFinal = triggered && playerState.inFinalRound

    setState(prev => {
      const next: Record<string, FarkleState> = {
        ...prev,
        [currentPlayer.id]: {
          total: newTotal,
          rounds: [...prev[currentPlayer.id].rounds, points],
          inFinalRound: newTotal >= WIN_SCORE || prev[currentPlayer.id].inFinalRound,
          finishedFinalRound: finishesFinal,
        }
      }
      // Mark others as in final round if trigger happened
      if (newTotal >= WIN_SCORE && !triggered) {
        players.forEach((p, i) => {
          if (i > currentIdx % players.length) {
            next[p.id] = { ...next[p.id], inFinalRound: true }
          }
        })
      }
      onScoreUpdate(currentPlayer.id, next[currentPlayer.id] as unknown as Record<string, unknown>)
      return next
    })

    setTurnInput('')
    let nextIdx = currentIdx + 1
    let tries = 0
    while (tries < players.length) {
      const np = players[nextIdx % players.length]
      if (!state[np.id].finishedFinalRound) break
      nextIdx++
      tries++
    }
    setCurrentIdx(nextIdx)
  }

  function handleFinish() {
    const results = players.map(p => ({ id: p.id, finalScore: state[p.id].total, rank: 0 }))
    results.sort((a, b) => b.finalScore - a.finalScore)
    results.forEach((r, i) => { r.rank = i + 1 })
    onComplete(results)
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* Scoreboard */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 4)}, 1fr)` }}>
        {players.map(p => {
          const ps = state[p.id]
          const isCurrent = p.id === currentPlayer.id && !isGameOver
          return (
            <div key={p.id} className={`bg-white border rounded-xl p-3 text-center transition-all ${isCurrent ? 'border-indigo-400 shadow-md' : 'border-gray-200'} ${ps.total >= WIN_SCORE ? 'border-green-300 bg-green-50' : ''}`}>
              <p className="text-xs font-medium text-gray-500 truncate mb-1">{p.display_name}</p>
              <p className={`text-3xl font-black ${ps.total >= WIN_SCORE ? 'text-green-600' : isCurrent ? 'text-indigo-600' : 'text-gray-900'}`}>{ps.total.toLocaleString()}</p>
              {ps.inFinalRound && !ps.finishedFinalRound && <p className="text-xs text-amber-600 font-medium">Final round!</p>}
              {isCurrent && <p className="text-xs text-indigo-400 mt-0.5">rolling</p>}
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        {players.map(p => (
          <div key={p.id} className="flex items-center gap-2 mb-1">
            <span className="text-xs w-20 truncate text-gray-500">{p.display_name}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (state[p.id].total / WIN_SCORE) * 100)}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-16 text-right">{state[p.id].total.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      {!isGameOver && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {currentPlayer.display_name}&apos;s turn
            {state[currentPlayer.id].inFinalRound && <span className="ml-2 text-amber-600 text-xs font-bold">FINAL ROUND</span>}
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="number" min={0} value={turnInput}
              onChange={e => setTurnInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitTurn()}
              placeholder="Points banked (0 = Farkle)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button onClick={submitTurn} className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
              OK
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {state[currentPlayer.id].total === 0 && <p className="text-xs text-gray-400 mt-1">Need 1000+ to open</p>}
        </div>
      )}

      {isGameOver && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
          <p className="font-bold text-green-800">Final round complete!</p>
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
