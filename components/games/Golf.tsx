'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'

type Phase = 'setup' | 'playing'

const PAR_NAMES: Record<string, string> = {
  '-3': 'Albatross', '-2': 'Eagle', '-1': 'Birdie', '0': 'Par', '1': 'Bogey', '2': 'Double', '3': 'Triple',
}
function parName(diff: number): string {
  return PAR_NAMES[String(diff)] ?? (diff > 0 ? `+${diff}` : String(diff))
}
function fmtVsPar(n: number): string {
  if (n === 0) return 'E'
  return n > 0 ? `+${n}` : String(n)
}

export default function Golf({ players, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [courseName, setCourseName] = useState('')
  const [holeCount, setHoleCount] = useState<9 | 18>(18)
  const [pars, setPars] = useState<number[]>(Array(18).fill(4))
  const [handicaps, setHandicaps] = useState<Record<string, number>>(
    Object.fromEntries(players.map(p => [p.id, 0]))
  )
  const [allStrokes, setAllStrokes] = useState<Array<Record<string, number>>>([])
  const [currentHole, setCurrentHole] = useState(0)
  const [holeInput, setHoleInput] = useState<Record<string, number>>({})

  const hasHandicaps = players.some(p => (handicaps[p.id] ?? 0) > 0)

  function effectiveHcp(playerId: string): number {
    const hcp = handicaps[playerId] ?? 0
    return holeCount === 9 ? Math.round(hcp / 2) : hcp
  }

  function setPar(index: number, par: number) {
    setPars(prev => prev.map((p, i) => i === index ? par : p))
  }

  function startGame() {
    const trimmed = pars.slice(0, holeCount)
    setAllStrokes(Array(holeCount).fill(null).map(() => ({})))
    setHoleInput(Object.fromEntries(players.map(p => [p.id, trimmed[0]])))
    setPhase('playing')
  }

  function saveHole() {
    const newStrokes = allStrokes.map((h, i) => i === currentHole ? { ...holeInput } : h)
    setAllStrokes(newStrokes)

    players.forEach(p => {
      const playerHoles = newStrokes.map(h => h[p.id] ?? 0)
      onScoreUpdate(p.id, { holes: playerHoles, pars: pars.slice(0, holeCount), courseName, handicap: handicaps[p.id] ?? 0 })
    })

    if (currentHole < holeCount - 1) {
      const next = currentHole + 1
      setCurrentHole(next)
      setHoleInput(Object.fromEntries(players.map(p => [p.id, pars[next]])))
    } else {
      const totals = players
        .map(p => {
          const gross = newStrokes.reduce((s, h) => s + (h[p.id] ?? 0), 0)
          const net = gross - effectiveHcp(p.id)
          return { id: p.id, gross, net }
        })
        .sort((a, b) => (hasHandicaps ? a.net - b.net : a.gross - b.gross))
      onComplete(totals.map((t, i) => ({ id: t.id, finalScore: hasHandicaps ? t.net : t.gross, rank: i + 1 })))
    }
  }

  function totalStrokes(playerId: string, upTo?: number): number {
    const holes = upTo !== undefined ? allStrokes.slice(0, upTo) : allStrokes
    return holes.reduce((s, h) => s + (h[playerId] ?? 0), 0)
  }

  function totalVsPar(playerId: string, upTo: number): number {
    return allStrokes.slice(0, upTo).reduce((s, h, i) => s + (h[playerId] ?? 0) - pars[i], 0)
  }

  function netTotal(playerId: string, upTo: number): number {
    const gross = totalStrokes(playerId, upTo)
    const hcp = effectiveHcp(playerId)
    const hcpApplied = Math.round(hcp * upTo / holeCount)
    return gross - hcpApplied
  }

  // ── Setup phase ──────────────────────────────────────────────
  if (phase === 'setup') {
    const totalPar = pars.slice(0, holeCount).reduce((a, b) => a + b, 0)
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Banenavn (valgfritt)</label>
          <input
            type="text"
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
            placeholder="F.eks. Trysil Golfklubb — Bane A"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Antall hull</label>
          <div className="flex gap-3">
            {([9, 18] as const).map(n => (
              <button
                key={n}
                onClick={() => { setHoleCount(n); setPars(Array(n).fill(4)) }}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-colors ${
                  holeCount === n
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                }`}
              >
                {n} hull
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Par per hull</label>
            <span className="text-xs text-gray-400">Total par: <strong className="text-gray-700">{totalPar}</strong></span>
          </div>
          <div className="flex gap-2 mb-2">
            <button onClick={() => setPars(Array(holeCount).fill(3))} className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Alle par 3</button>
            <button onClick={() => setPars(Array(holeCount).fill(4))} className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Alle par 4</button>
            <button onClick={() => setPars(Array(holeCount).fill(5))} className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1">Alle par 5</button>
          </div>
          {holeCount === 18 && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 mt-2">Hull 1–9</p>
          )}
          <div className="space-y-1">
            {pars.slice(0, Math.min(holeCount, 9)).map((par, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-800 w-14 shrink-0">Hull {i + 1}</span>
                <div className="flex gap-1 flex-1">
                  {[3, 4, 5].map(p => (
                    <button
                      key={p}
                      onClick={() => setPar(i, p)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                        par === p
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {holeCount === 18 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 mt-3">Hull 10–18</p>
              <div className="space-y-1">
                {pars.slice(9, 18).map((par, j) => {
                  const i = j + 9
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-800 w-14 shrink-0">Hull {i + 1}</span>
                      <div className="flex gap-1 flex-1">
                        {[3, 4, 5].map(p => (
                          <button
                            key={p}
                            onClick={() => setPar(i, p)}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                              par === p
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-gray-700">Handikap (valgfritt)</label>
            <span className="text-xs text-gray-400">{holeCount === 9 ? 'halveres for 9 hull' : '18-hulls HCP'}</span>
          </div>
          <p className="text-xs text-gray-400 mb-2">Skriv inn 0 hvis dere spiller brutto</p>
          <div className="space-y-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{p.display_name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHandicaps(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1) }))}
                    className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 flex items-center justify-center text-sm"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-gray-900 text-sm">{handicaps[p.id] ?? 0}</span>
                  <button
                    onClick={() => setHandicaps(prev => ({ ...prev, [p.id]: Math.min(54, (prev[p.id] ?? 0) + 1) }))}
                    className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Start runde ⛳
        </button>
        <button onClick={onAbandon} className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">Avbryt</button>
      </div>
    )
  }

  // ── Playing phase ─────────────────────────────────────────────
  const par = pars[currentHole]
  const completed = currentHole // number of holes saved so far

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        {courseName && <p className="text-xs text-gray-500 mb-1">{courseName}</p>}
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-xs text-gray-400 uppercase tracking-wide">Hull {currentHole + 1} / {holeCount}</span>
          <div className="flex gap-0.5">
            {pars.slice(0, holeCount).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < currentHole ? 'bg-green-400' : i === currentHole ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-4xl font-black text-gray-900">Par {par}</p>
      </div>

      {/* Stroke inputs */}
      <div className="space-y-2">
        {players.map(p => {
          const strokes = holeInput[p.id] ?? par
          const diff = strokes - par
          const diffColor = diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-gray-400'
          const hcp = handicaps[p.id] ?? 0
          return (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-800 truncate block">{p.display_name}</span>
                {hcp > 0 && <span className="text-xs text-gray-400">HCP {hcp}{holeCount === 9 ? ` (netto ${Math.round(hcp / 2)})` : ''}</span>}
              </div>
              {completed > 0 && (
                <span className={`text-xs font-semibold w-8 text-right ${totalVsPar(p.id, completed) < 0 ? 'text-green-600' : totalVsPar(p.id, completed) > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {fmtVsPar(totalVsPar(p.id, completed))}
                </span>
              )}
              <button
                onClick={() => setHoleInput(prev => ({ ...prev, [p.id]: Math.max(1, (prev[p.id] ?? par) - 1) }))}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                −
              </button>
              <span className="w-7 text-center font-black text-xl text-gray-900">{strokes}</span>
              <button
                onClick={() => setHoleInput(prev => ({ ...prev, [p.id]: (prev[p.id] ?? par) + 1 }))}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                +
              </button>
              <span className={`text-xs font-bold w-14 text-right ${diffColor}`}>
                {parName(diff)}
              </span>
            </div>
          )
        })}
      </div>

      <button
        onClick={saveHole}
        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
      >
        {currentHole < holeCount - 1 ? `Neste hull →` : 'Avslutt runde 🏁'}
      </button>

      {/* Mini leaderboard */}
      {completed > 0 && (
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Stilling etter {completed} hull
            </p>
            {hasHandicaps && (
              <span className="text-xs text-gray-400">netto</span>
            )}
          </div>
          {players
            .map(p => ({
              ...p,
              gross: totalStrokes(p.id, completed),
              net: netTotal(p.id, completed),
              vsPar: totalVsPar(p.id, completed),
            }))
            .sort((a, b) => hasHandicaps ? a.net - b.net : a.gross - b.gross)
            .map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 text-sm py-0.5">
                <span className="text-gray-400 w-4 shrink-0">{i + 1}.</span>
                <span className="flex-1 font-medium text-gray-800 truncate">{p.display_name}</span>
                {hasHandicaps ? (
                  <>
                    <span className="text-xs text-gray-400">{p.gross}</span>
                    <span className="font-bold text-gray-900 w-8 text-right">{p.net}</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-gray-900">{p.gross}</span>
                    <span className={`text-xs font-semibold w-8 text-right ${p.vsPar < 0 ? 'text-green-600' : p.vsPar > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {fmtVsPar(p.vsPar)}
                    </span>
                  </>
                )}
              </div>
            ))}
        </div>
      )}

      <button onClick={onAbandon} className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">Avbryt</button>
    </div>
  )
}
