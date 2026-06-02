'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'

export default function Chess({ players, onComplete, onAbandon }: GameComponentProps) {
  const [result, setResult] = useState<'p1' | 'draw' | 'p2' | null>(null)

  const p1 = players[0]
  const p2 = players[1]

  function submit() {
    if (!result) return
    if (result === 'p1') {
      onComplete([
        { id: p1.id, finalScore: 1, rank: 1 },
        { id: p2.id, finalScore: 0, rank: 2 },
      ])
    } else if (result === 'p2') {
      onComplete([
        { id: p1.id, finalScore: 0, rank: 2 },
        { id: p2.id, finalScore: 1, rank: 1 },
      ])
    } else {
      // Draw — both rank 1, Elo treats this as 0.5 actual score each
      onComplete([
        { id: p1.id, finalScore: 1, rank: 1 },
        { id: p2.id, finalScore: 1, rank: 1 },
      ])
    }
  }

  const btnBase = 'w-full py-4 px-5 rounded-2xl border-2 font-bold transition-colors flex items-center gap-3 text-left'

  return (
    <div className="max-w-sm mx-auto py-10 px-4 flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="text-5xl mb-3">♟️</div>
        <h2 className="text-2xl font-black text-gray-900">Sjakk</h2>
        <p className="text-sm text-gray-500 mt-1">Hvem vant partiet?</p>
      </div>

      {/* VS display */}
      <div className="w-full flex items-center gap-3">
        <div className={`flex-1 py-3 px-4 rounded-2xl border-2 text-center transition-colors
          ${result === 'p1' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
          <p className="font-black text-gray-900 truncate text-sm">{p1.display_name}</p>
        </div>
        <span className="text-xs font-bold text-gray-400 shrink-0">VS</span>
        <div className={`flex-1 py-3 px-4 rounded-2xl border-2 text-center transition-colors
          ${result === 'p2' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
          <p className="font-black text-gray-900 truncate text-sm">{p2.display_name}</p>
        </div>
      </div>

      {/* Result buttons */}
      <div className="w-full space-y-3">
        <button
          onClick={() => setResult('p1')}
          className={`${btnBase} ${
            result === 'p1'
              ? 'border-indigo-500 bg-indigo-600 text-white'
              : 'border-gray-200 bg-white text-gray-800 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
        >
          <span className="text-2xl">🏆</span>
          <span>{p1.display_name} vant</span>
        </button>

        <button
          onClick={() => setResult('draw')}
          className={`${btnBase} ${
            result === 'draw'
              ? 'border-amber-400 bg-amber-400 text-white'
              : 'border-gray-200 bg-white text-gray-800 hover:border-amber-300 hover:bg-amber-50'
          }`}
        >
          <span className="text-2xl">🤝</span>
          <span>Remis (uavgjort)</span>
        </button>

        <button
          onClick={() => setResult('p2')}
          className={`${btnBase} ${
            result === 'p2'
              ? 'border-indigo-500 bg-indigo-600 text-white'
              : 'border-gray-200 bg-white text-gray-800 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
        >
          <span className="text-2xl">🏆</span>
          <span>{p2.display_name} vant</span>
        </button>
      </div>

      {/* Submit */}
      <div className="w-full space-y-2">
        <button
          onClick={submit}
          disabled={!result}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-2xl transition-colors disabled:opacity-40"
        >
          Registrer resultat
        </button>
        <button
          onClick={() => { if (confirm('Avbryt spillet?')) onAbandon() }}
          className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
        >
          Avbryt
        </button>
      </div>
    </div>
  )
}
