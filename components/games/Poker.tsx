'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameComponentProps } from '@/lib/types'

type Phase = 'setup' | 'running' | 'break' | 'complete'

interface ScheduleEntry {
  isBreak: boolean
  level: number
  small: number
  big: number
  ante: number
  durationMinutes: number
}

const BLIND_STRUCTURE: Array<{ small: number; big: number; ante: number }> = [
  { small: 25,   big: 50,    ante: 0   },
  { small: 50,   big: 100,   ante: 0   },
  { small: 75,   big: 150,   ante: 0   },
  { small: 100,  big: 200,   ante: 0   },
  { small: 150,  big: 300,   ante: 0   },
  { small: 200,  big: 400,   ante: 25  },
  { small: 300,  big: 600,   ante: 50  },
  { small: 400,  big: 800,   ante: 50  },
  { small: 500,  big: 1000,  ante: 75  },
  { small: 750,  big: 1500,  ante: 100 },
  { small: 1000, big: 2000,  ante: 150 },
  { small: 1500, big: 3000,  ante: 200 },
  { small: 2000, big: 4000,  ante: 300 },
  { small: 3000, big: 6000,  ante: 500 },
  { small: 5000, big: 10000, ante: 750 },
]

function buildSchedule(levelDuration: number, breakEvery: number, breakDuration: number): ScheduleEntry[] {
  const entries: ScheduleEntry[] = []
  let lvl = 0
  for (let i = 0; i < BLIND_STRUCTURE.length; i++) {
    if (i > 0 && i % breakEvery === 0) {
      entries.push({ isBreak: true, level: 0, small: 0, big: 0, ante: 0, durationMinutes: breakDuration })
    }
    lvl++
    entries.push({ isBreak: false, level: lvl, ...BLIND_STRUCTURE[i], durationMinutes: levelDuration })
  }
  return entries
}

function pad2(n: number) { return n.toString().padStart(2, '0') }
function fmtTime(s: number) { return `${Math.floor(s / 60)}:${pad2(s % 60)}` }
function fmtN(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M'
  if (n >= 1000)      return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K'
  return n.toLocaleString('nb-NO')
}

export default function Poker({ players, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  // Setup
  const [levelDuration, setLevelDuration] = useState(20)
  const [breakEvery, setBreakEvery]       = useState(4)
  const [breakDuration, setBreakDuration] = useState(10)

  // Game state
  const [phase, setPhase]               = useState<Phase>('setup')
  const [schedule, setSchedule]         = useState<ScheduleEntry[]>([])
  const [entryIndex, setEntryIndex]     = useState(0)
  const [displaySecs, setDisplaySecs]   = useState(0)
  const [levelEndEpoch, setLevelEndEpoch] = useState<number | null>(null)
  const [pausedSecs, setPausedSecs]     = useState<number | null>(null) // non-null = paused
  const [activeIds, setActiveIds]       = useState<string[]>(players.map(p => p.id))
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([])
  const [chips, setChips]               = useState<Record<string, number>>(Object.fromEntries(players.map(p => [p.id, 0])))
  const [showChipInput, setShowChipInput] = useState(false)

  // Refs for use inside interval (avoid stale closures)
  const entryIndexRef    = useRef(0)
  const scheduleRef      = useRef<ScheduleEntry[]>([])
  const levelEndRef      = useRef<number | null>(null)
  const pausedRef        = useRef(false)
  const advancingRef     = useRef(false)

  useEffect(() => { entryIndexRef.current = entryIndex }, [entryIndex])
  useEffect(() => { scheduleRef.current   = schedule },   [schedule])
  useEffect(() => { levelEndRef.current   = levelEndEpoch }, [levelEndEpoch])
  useEffect(() => { pausedRef.current     = pausedSecs !== null }, [pausedSecs])

  const isPaused       = pausedSecs !== null
  const currentEntry   = schedule[entryIndex]
  const nextPlayEntry  = schedule.slice(entryIndex + 1).find(e => !e.isBreak)

  // ── Advance to next schedule entry ──────────────────────────
  const advanceEntry = useCallback(() => {
    if (advancingRef.current) return
    advancingRef.current = true
    setTimeout(() => { advancingRef.current = false }, 2000)

    const nextIdx = entryIndexRef.current + 1
    const sched   = scheduleRef.current
    if (nextIdx >= sched.length) return
    const next    = sched[nextIdx]
    const endEpoch = Date.now() + next.durationMinutes * 60 * 1000

    entryIndexRef.current = nextIdx
    levelEndRef.current   = endEpoch

    setEntryIndex(nextIdx)
    setLevelEndEpoch(endEpoch)
    setDisplaySecs(next.durationMinutes * 60)
    setPausedSecs(null)

    if (next.isBreak) {
      setPhase('break')
      setShowChipInput(true)
    } else {
      setPhase('running')
    }
  }, [])

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'setup' || phase === 'complete') return

    const id = setInterval(() => {
      if (pausedRef.current) return
      const endEpoch = levelEndRef.current
      if (endEpoch === null) return
      const remaining = Math.max(0, Math.round((endEpoch - Date.now()) / 1000))
      setDisplaySecs(remaining)
      if (remaining === 0) advanceEntry()
    }, 500)

    return () => clearInterval(id)
  }, [phase, advanceEntry])

  // ── Start tournament ─────────────────────────────────────────
  function startTournament() {
    const sched    = buildSchedule(levelDuration, breakEvery, breakDuration)
    const first    = sched[0]
    const endEpoch = Date.now() + first.durationMinutes * 60 * 1000

    scheduleRef.current   = sched
    entryIndexRef.current = 0
    levelEndRef.current   = endEpoch

    setSchedule(sched)
    setEntryIndex(0)
    setLevelEndEpoch(endEpoch)
    setDisplaySecs(first.durationMinutes * 60)
    setPausedSecs(null)
    setActiveIds(players.map(p => p.id))
    setEliminatedIds([])
    setPhase(first.isBreak ? 'break' : 'running')
  }

  // ── Pause / Resume ───────────────────────────────────────────
  function togglePause() {
    if (isPaused) {
      const endEpoch = Date.now() + (pausedSecs ?? 0) * 1000
      levelEndRef.current = endEpoch
      setLevelEndEpoch(endEpoch)
      setPausedSecs(null)
    } else {
      const endEpoch  = levelEndRef.current
      const remaining = endEpoch ? Math.max(0, Math.round((endEpoch - Date.now()) / 1000)) : displaySecs
      levelEndRef.current = null
      setLevelEndEpoch(null)
      setPausedSecs(remaining)
      setDisplaySecs(remaining)
    }
  }

  // ── Eliminate player ─────────────────────────────────────────
  function eliminatePlayer(id: string) {
    const newActive     = activeIds.filter(pid => pid !== id)
    const newEliminated = [...eliminatedIds, id]
    setActiveIds(newActive)
    setEliminatedIds(newEliminated)
    onScoreUpdate(id, { eliminated: true, eliminationOrder: newEliminated.length })

    if (newActive.length <= 1) {
      const orderedByRank = newActive.length === 1
        ? [newActive[0], ...newEliminated.slice().reverse()]
        : newEliminated.slice().reverse()
      onComplete(orderedByRank.map((pid, i) => ({ id: pid, finalScore: orderedByRank.length - i, rank: i + 1 })))
      setPhase('complete')
    }
  }

  function manualComplete() {
    if (!confirm('Avslutt turneringen og registrer nåværende plassering?')) return
    const byChips = [...activeIds]
      .map(id => ({ id, chips: chips[id] ?? 0 }))
      .sort((a, b) => b.chips - a.chips)
    const orderedByRank = [...byChips.map(p => p.id), ...eliminatedIds.slice().reverse()]
    onComplete(orderedByRank.map((pid, i) => ({ id: pid, finalScore: orderedByRank.length - i, rank: i + 1 })))
    setPhase('complete')
  }

  const secsToShow = isPaused ? (pausedSecs ?? 0) : displaySecs

  // ══════════════════════════════════════════════════════
  // SETUP
  // ══════════════════════════════════════════════════════
  if (phase === 'setup') {
    const preview   = buildSchedule(levelDuration, breakEvery, breakDuration)
    const totalMins = preview.reduce((s, e) => s + e.durationMinutes, 0)
    const h = Math.floor(totalMins / 60), m = totalMins % 60

    return (
      <div className="space-y-6 p-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nivåvarighet</label>
          <div className="flex gap-2">
            {[10, 15, 20, 25, 30].map(n => (
              <button key={n} onClick={() => setLevelDuration(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${levelDuration === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'}`}>
                {n} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pause etter hvert</label>
          <div className="flex gap-2">
            {[3, 4, 5, 6].map(n => (
              <button key={n} onClick={() => setBreakEvery(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${breakEvery === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'}`}>
                {n}. nivå
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pauselengde</label>
          <div className="flex gap-2">
            {[10, 15, 20].map(n => (
              <button key={n} onClick={() => setBreakDuration(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${breakDuration === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'}`}>
                {n} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Blindstruktur</label>
            <span className="text-xs text-gray-400">~{h > 0 ? `${h}t ` : ''}{m}min totalt</span>
          </div>
          <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 max-h-56 overflow-y-auto text-sm">
            {preview.map((e, i) =>
              e.isBreak ? (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-amber-50">
                  <span className="text-xs font-bold text-amber-600 tracking-wide">☕ PAUSE</span>
                  <span className="text-xs text-amber-500">{e.durationMinutes} min</span>
                </div>
              ) : (
                <div key={i} className="flex items-center gap-2 px-3 py-2">
                  <span className="text-xs text-gray-400 w-14 shrink-0">Nivå {e.level}</span>
                  <span className="font-bold text-gray-800">{e.small.toLocaleString('nb-NO')} / {e.big.toLocaleString('nb-NO')}</span>
                  {e.ante > 0 && <span className="text-xs text-gray-400">Ante {e.ante}</span>}
                  <span className="ml-auto text-xs text-gray-400">{e.durationMinutes} min</span>
                </div>
              )
            )}
          </div>
        </div>

        <button onClick={startTournament}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
          Start turnering 🃏
        </button>
        <button onClick={onAbandon} className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">Avbryt</button>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  // CLOCK VIEW (running + break)
  // ══════════════════════════════════════════════════════
  const isBreakPhase  = phase === 'break'
  const isWarning     = !isBreakPhase && !isPaused && secsToShow <= 60 && secsToShow > 0
  const hasChips      = activeIds.some(id => (chips[id] ?? 0) > 0)
  const sortedByChips = [...activeIds]
    .map(id => ({ id, chips: chips[id] ?? 0, name: players.find(p => p.id === id)?.display_name ?? '' }))
    .sort((a, b) => b.chips - a.chips)
  const nextBigBlind  = isBreakPhase ? nextPlayEntry?.big : schedule.slice(entryIndex + 1).find(e => !e.isBreak)?.big

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-900 text-white flex flex-col select-none">

      {/* ── Controls bar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex gap-2">
          <button onClick={togglePause}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isPaused ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
            {isPaused ? '▶ Fortsett' : '⏸ Pause'}
          </button>
          <button onClick={advanceEntry} title="Neste nivå"
            className="px-3 py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 transition-colors" >
            ⏭
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowChipInput(p => !p)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${showChipInput ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
            🪙 Sjettong
          </button>
          <button onClick={manualComplete} className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1">
            Avslutt
          </button>
        </div>
      </div>

      {/* ── Main clock ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 text-center">
        {isBreakPhase ? (
          <>
            <p className="text-amber-400 text-xs font-bold tracking-[0.4em] mb-4">☕ PAUSE</p>
            <p className={`font-black tabular-nums leading-none transition-colors ${secsToShow <= 60 && !isPaused ? 'text-red-400' : isPaused ? 'text-slate-500' : 'text-amber-300'}`}
              style={{ fontSize: 'clamp(5rem, 20vw, 10rem)' }}>
              {fmtTime(secsToShow)}
            </p>
            {nextPlayEntry && (
              <p className="text-slate-400 mt-5 text-base">
                Neste: Nivå {nextPlayEntry.level} — {nextPlayEntry.small.toLocaleString('nb-NO')} / {nextPlayEntry.big.toLocaleString('nb-NO')}
                {nextPlayEntry.ante > 0 && <span className="text-slate-500"> · Ante {nextPlayEntry.ante}</span>}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-slate-500 text-xs font-bold tracking-[0.4em] mb-3">NIVÅ {currentEntry?.level}</p>
            <p className="font-black text-white leading-none"
              style={{ fontSize: 'clamp(2.8rem, 12vw, 6.5rem)' }}>
              {currentEntry ? `${fmtN(currentEntry.small)} / ${fmtN(currentEntry.big)}` : '—'}
            </p>
            {(currentEntry?.ante ?? 0) > 0 && (
              <p className="text-slate-400 mt-2 text-lg">Ante: {currentEntry!.ante.toLocaleString('nb-NO')}</p>
            )}
            <p className={`font-black tabular-nums leading-none mt-4 transition-colors ${isWarning ? 'text-red-400' : isPaused ? 'text-slate-500' : 'text-emerald-400'}`}
              style={{ fontSize: 'clamp(4rem, 16vw, 8rem)' }}>
              {fmtTime(secsToShow)}
            </p>
            {nextPlayEntry && (
              <p className="text-slate-500 mt-3 text-sm">
                Neste: Nivå {nextPlayEntry.level} — {nextPlayEntry.small.toLocaleString('nb-NO')} / {nextPlayEntry.big.toLocaleString('nb-NO')}
                {nextPlayEntry.ante > 0 && <span> · Ante {nextPlayEntry.ante}</span>}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Bottom panels ── */}
      <div className="px-4 pb-4 space-y-3">

        {/* Chip input form */}
        {showChipInput && (
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-300">🪙 Sjettong-telling</p>
              <button onClick={() => setShowChipInput(false)} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
            </div>
            <div className="space-y-2">
              {activeIds.map(id => {
                const p         = players.find(pl => pl.id === id)!
                const bigBlind  = isBreakPhase ? nextPlayEntry?.big : currentEntry?.big
                const bbs       = bigBlind && (chips[id] ?? 0) > 0 ? Math.round((chips[id] ?? 0) / bigBlind) : null
                return (
                  <div key={id} className="flex items-center gap-2">
                    <span className="text-sm text-slate-300 flex-1 truncate">{p.display_name}</span>
                    {bbs !== null && <span className="text-xs text-slate-500">{bbs} BB</span>}
                    <input
                      type="number"
                      inputMode="numeric"
                      value={chips[id] || ''}
                      onChange={e => setChips(prev => ({ ...prev, [id]: Number(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-28 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-right text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Chip leaderboard (compact, when data exists + input closed) */}
        {!showChipInput && hasChips && (
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Sjettong-ledere</p>
            <div className="space-y-1">
              {sortedByChips.filter(p => p.chips > 0).slice(0, 5).map((p, i) => {
                const bigBlind = isBreakPhase ? nextPlayEntry?.big : currentEntry?.big
                const bbs      = bigBlind ? Math.round(p.chips / bigBlind) : null
                return (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <span className="w-5 shrink-0 text-center text-base">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                    <span className="flex-1 text-slate-200 truncate">{p.name}</span>
                    <span className="font-bold text-white">{fmtN(p.chips)}</span>
                    {bbs !== null && <span className="text-slate-500 text-xs w-14 text-right">{bbs} BB</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Break: prominent chip leaders when chip panel closed */}
        {isBreakPhase && !showChipInput && !hasChips && (
          <button onClick={() => setShowChipInput(true)}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
            🪙 Tell inn sjettonger
          </button>
        )}

        {/* Players + elimination */}
        <div className="bg-slate-800 rounded-xl p-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            Spillere — {activeIds.length} igjen av {players.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {activeIds.map(id => {
              const p = players.find(pl => pl.id === id)!
              return (
                <button key={id}
                  onClick={() => { if (confirm(`Marker ${p.display_name} som ute?`)) eliminatePlayer(id) }}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-red-800 text-sm font-medium text-white transition-colors">
                  {p.display_name}
                </button>
              )
            })}
            {eliminatedIds.slice().reverse().map((id, revIdx) => {
              const origIdx = eliminatedIds.length - 1 - revIdx
              const rank    = players.length - origIdx
              const p       = players.find(pl => pl.id === id)!
              return (
                <span key={id} className="px-3 py-1.5 rounded-lg bg-slate-900 text-sm text-slate-600">
                  {rank}. {p.display_name}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
