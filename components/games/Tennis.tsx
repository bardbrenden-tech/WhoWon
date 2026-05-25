'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'

interface SetResult {
  winnerId: string
  score: string
}

export default function Tennis({ players, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const [sets, setSets] = useState<SetResult[]>([])
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)
  const [setScore, setSetScore] = useState('')

  function setsWon(playerId: string) {
    return sets.filter(s => s.winnerId === playerId).length
  }

  function addSet() {
    if (!selectedWinner) return
    const newSets = [...sets, { winnerId: selectedWinner, score: setScore.trim() }]
    setSets(newSets)
    setSelectedWinner(null)
    setSetScore('')
    players.forEach(p => {
      onScoreUpdate(p.id, { setsWon: newSets.filter(s => s.winnerId === p.id).length })
    })
  }

  function complete() {
    const ranked = [...players]
      .map(p => ({ id: p.id, sets: setsWon(p.id) }))
      .sort((a, b) => b.sets - a.sets)
    let rank = 1
    onComplete(ranked.map((r, i) => {
      if (i > 0 && ranked[i - 1].sets > r.sets) rank = i + 1
      return { id: r.id, finalScore: r.sets, rank }
    }))
  }

  const leader = [...players].sort((a, b) => setsWon(b.id) - setsWon(a.id))

  return (
    <div className="space-y-5">
      {/* Score board */}
      <div className={`grid gap-3 ${players.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {leader.map((p, i) => (
          <div key={p.id} className={`rounded-xl p-4 text-center border ${i === 0 && setsWon(p.id) > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
            <p className="text-xs font-semibold text-gray-500 truncate mb-1">{p.display_name}</p>
            <p className={`text-5xl font-black ${i === 0 && setsWon(p.id) > 0 ? 'text-indigo-600' : 'text-gray-900'}`}>
              {setsWon(p.id)}
            </p>
            <p className="text-xs text-gray-400 mt-1">sett</p>
          </div>
        ))}
      </div>

      {/* Set history */}
      {sets.length > 0 && (
        <div className="space-y-1">
          {sets.map((s, i) => {
            const winner = players.find(p => p.id === s.winnerId)
            return (
              <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-xs w-12">Sett {i + 1}</span>
                <span className="font-semibold text-gray-800 flex-1 text-center">{winner?.display_name}</span>
                <span className="text-gray-500 text-xs w-12 text-right">{s.score}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Add set */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Sett {sets.length + 1} — hvem vant?</p>
        <div className="flex flex-wrap gap-2">
          {players.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedWinner(p.id)}
              className={`flex-1 min-w-[6rem] py-2 rounded-lg text-sm font-semibold border transition-colors ${
                selectedWinner === p.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {p.display_name}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={setScore}
          onChange={e => setSetScore(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && selectedWinner && addSet()}
          placeholder="Resultat, f.eks. 6-4 (valgfritt)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <button
          onClick={addSet}
          disabled={!selectedWinner}
          className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          Legg til sett
        </button>
      </div>

      <button
        onClick={complete}
        disabled={sets.length === 0}
        className="w-full border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors"
      >
        Avslutt kamp
      </button>
      <button onClick={onAbandon} className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">Avbryt</button>
    </div>
  )
}
