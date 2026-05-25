'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'

interface RoundEntry { [playerId: string]: number }

export default function GenericScorecard({ players, options, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const higherIsBetter = (options.higher_is_better as boolean) ?? true

  const [rounds, setRounds] = useState<RoundEntry[]>(() => {
    const saved = players[0]?.score_data?.rounds as RoundEntry[] | undefined
    return saved ?? []
  })
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  const totals = Object.fromEntries(players.map(p => [
    p.id,
    rounds.reduce((sum, r) => sum + (r[p.id] ?? 0), 0),
  ]))

  const leaderId = players.reduce((best, p) => {
    if (!best) return p.id
    return higherIsBetter ? (totals[p.id] > totals[best] ? p.id : best) : (totals[p.id] < totals[best] ? p.id : best)
  }, '' as string)

  function addRound() {
    const entry: RoundEntry = {}
    for (const p of players) {
      const val = parseInt(inputs[p.id] ?? '')
      if (isNaN(val)) { setError(`Missing score for ${p.display_name}`); return }
      entry[p.id] = val
    }
    setError('')
    const newRounds = [...rounds, entry]
    setRounds(newRounds)
    setInputs({})
    players.forEach(p => onScoreUpdate(p.id, { rounds: newRounds }))
  }

  function undoLast() {
    if (rounds.length === 0) return
    const newRounds = rounds.slice(0, -1)
    setRounds(newRounds)
    players.forEach(p => onScoreUpdate(p.id, { rounds: newRounds }))
  }

  function finishGame() {
    const results = players.map(p => ({ id: p.id, finalScore: totals[p.id], rank: 0 }))
    results.sort((a, b) => higherIsBetter ? b.finalScore - a.finalScore : a.finalScore - b.finalScore)
    results.forEach((r, i) => { r.rank = i + 1 })
    onComplete(results)
  }

  const cols = Math.min(players.length, 5)

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">

      {/* Totals */}
      <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {players.map(p => (
          <div key={p.id} className={`bg-white border rounded-xl p-3 text-center transition-all ${p.id === leaderId && rounds.length > 0 ? 'border-yellow-400 shadow-md' : 'border-gray-200'}`}>
            <p className="text-xs font-medium text-gray-500 truncate mb-1">{p.display_name}</p>
            <p className={`text-2xl font-black ${p.id === leaderId && rounds.length > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>
              {totals[p.id]}
            </p>
          </div>
        ))}
      </div>

      {/* Round history table */}
      {rounds.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-3 py-2 text-xs text-gray-400 font-medium w-10">#</th>
                  {players.map(p => (
                    <th key={p.id} className="px-3 py-2 text-xs text-gray-500 font-medium text-center">{p.display_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rounds.map((round, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i === rounds.length - 1 ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-3 py-1.5 text-gray-300 text-xs">{i + 1}</td>
                    {players.map(p => (
                      <td key={p.id} className="px-3 py-1.5 text-center text-gray-700 text-sm">{round[p.id] ?? 0}</td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-3 py-2 text-xs font-bold text-gray-500">Σ</td>
                  {players.map(p => (
                    <td key={p.id} className={`px-3 py-2 text-center font-black text-base ${p.id === leaderId ? 'text-yellow-600' : 'text-indigo-600'}`}>{totals[p.id]}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add round */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {rounds.length === 0 ? 'Enter scores' : `Round ${rounds.length + 1}`}
        </p>
        <div className="space-y-2">
          {players.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 flex-1 truncate">{p.display_name}</span>
              <input
                type="number"
                value={inputs[p.id] ?? ''}
                onChange={e => setInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (idx === players.length - 1) addRound()
                    else {
                      const next = players[idx + 1]
                      document.getElementById(`score-input-${next.id}`)?.focus()
                    }
                  }
                }}
                id={`score-input-${p.id}`}
                placeholder="0"
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus={idx === 0}
              />
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <div className="flex gap-2 mt-3">
          {rounds.length > 0 && (
            <button onClick={undoLast} className="border border-gray-300 text-gray-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Undo last
            </button>
          )}
          <button onClick={addRound} className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
            + Add Round
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { if (confirm('Abandon game? No ratings will change.')) onAbandon() }}
          className="border border-gray-300 text-gray-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Abandon
        </button>
        <button
          onClick={() => { if (rounds.length === 0 || confirm('Finish game and record results?')) finishGame() }}
          disabled={rounds.length === 0}
          className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40"
        >
          Finish Game
        </button>
      </div>
    </div>
  )
}
