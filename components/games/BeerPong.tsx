'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'

const CUP_FORMATIONS: Record<number, number[][]> = {
  10: [[0,1,2,3],[4,5,6],[7,8],[9]],
  6:  [[0,1,2],[3,4],[5]],
  3:  [[0,1],[2]],
}

type Phase = 'setup' | 'playing'

export default function BeerPong({ players, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const [phase, setPhase]     = useState<Phase>('setup')
  const [cupCount, setCupCount] = useState(10)
  const [cups, setCups]       = useState<Record<string, boolean[]>>({})

  const p0 = players[0]
  const p1 = players[1]

  function startGame() {
    const initial: Record<string, boolean[]> = {
      [p0.id]: Array(cupCount).fill(true),
      [p1.id]: Array(cupCount).fill(true),
    }
    setCups(initial)
    onScoreUpdate(p0.id, { cups: initial[p0.id], cupCount })
    onScoreUpdate(p1.id, { cups: initial[p1.id], cupCount })
    setPhase('playing')
  }

  function hitCup(playerId: string, idx: number) {
    const updated = cups[playerId].map((c, i) => i === idx ? false : c)
    const newCups = { ...cups, [playerId]: updated }
    setCups(newCups)
    onScoreUpdate(playerId, { cups: updated, cupCount })

    const remaining = updated.filter(Boolean).length
    if (remaining === 0) {
      // playerId lost — the other player wins
      const winnerId = playerId === p0.id ? p1.id : p0.id
      const loserId  = playerId
      onComplete([
        { id: winnerId, finalScore: cupCount, rank: 1 },
        { id: loserId,  finalScore: 0,        rank: 2 },
      ])
    }
  }

  function CupRack({ playerId, label }: { playerId: string; label: string }) {
    const state    = cups[playerId] ?? []
    const rows     = CUP_FORMATIONS[cupCount] ?? CUP_FORMATIONS[10]
    const remaining = state.filter(Boolean).length

    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-gray-700 truncate max-w-[120px] text-center">{label}</p>
        <p className="text-xs text-gray-400">{remaining}/{cupCount} kopper</p>
        <div className="flex flex-col items-center gap-1.5">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-1.5">
              {row.map(idx => {
                const standing = state[idx] ?? true
                return (
                  <button
                    key={idx}
                    disabled={!standing}
                    onClick={() => hitCup(playerId, idx)}
                    className={`w-10 h-10 rounded-full border-2 text-lg transition-all font-bold
                      ${standing
                        ? 'bg-amber-400 border-amber-500 hover:bg-amber-300 hover:scale-110 active:scale-95 shadow-md'
                        : 'bg-gray-100 border-gray-200 text-gray-300 cursor-default'
                      }`}
                  >
                    {standing ? '🍺' : '✕'}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'setup') {
    return (
      <div className="max-w-sm mx-auto py-10 px-4 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-5xl mb-2">🍺</div>
          <h2 className="text-xl font-black text-gray-900">Beer Pong</h2>
          <p className="text-sm text-gray-500 mt-1">
            {p0.display_name} vs {p1.display_name}
          </p>
        </div>

        <div className="w-full bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Antall kopper per lag</p>
          <div className="flex gap-2">
            {[3, 6, 10].map(n => (
              <button
                key={n}
                onClick={() => setCupCount(n)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                  cupCount === n
                    ? 'bg-amber-400 border-amber-500 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {cupCount === 10 ? 'Standard (4-3-2-1)' : cupCount === 6 ? 'Rask runde (3-2-1)' : 'Mini (2-1)'}
          </p>
        </div>

        <button
          onClick={startGame}
          className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black text-lg py-4 rounded-2xl transition-colors"
        >
          Start spill
        </button>
        <button
          onClick={() => { if (confirm('Avbryt spillet?')) onAbandon() }}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Avbryt
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="flex justify-between items-start gap-6">
        <CupRack playerId={p0.id} label={p0.display_name} />
        <div className="flex flex-col items-center justify-center pt-8 gap-2">
          <span className="text-2xl font-black text-gray-300">VS</span>
          <span className="text-xs text-gray-400">Trykk på en kopp for å markere treff</span>
        </div>
        <CupRack playerId={p1.id} label={p1.display_name} />
      </div>

      <div className="mt-10">
        <button
          onClick={() => { if (confirm('Avbryt spillet? Ingen resultater lagres.')) onAbandon() }}
          className="w-full border border-gray-200 text-gray-400 text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Avbryt
        </button>
      </div>
    </div>
  )
}
