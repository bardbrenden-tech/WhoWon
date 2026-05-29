'use client'
import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GameComponentProps } from '@/lib/types'

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
function makeRng(seed: number) {
  let s = (seed >>> 0) || 0xdeadbeef
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0x100000000 }
}

function sessionSeed(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h || 0xdeadbeef
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Sudoku Generator ──────────────────────────────────────────────────────────
type Grid = number[][]

function isValidPlacement(g: Grid, r: number, c: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (g[r][i] === n || g[i][c] === n) return false
  }
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++)
      if (g[br + dr][bc + dc] === n) return false
  return true
}

function fillGrid(g: Grid, rng: () => number, pos = 0): boolean {
  if (pos === 81) return true
  const r = Math.floor(pos / 9)
  const c = pos % 9
  if (g[r][c] !== 0) return fillGrid(g, rng, pos + 1)
  for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng)) {
    if (isValidPlacement(g, r, c, d)) {
      g[r][c] = d
      if (fillGrid(g, rng, pos + 1)) return true
      g[r][c] = 0
    }
  }
  return false
}

type Difficulty = 'easy' | 'medium' | 'hard'
const REMOVE_COUNT: Record<Difficulty, number> = { easy: 36, medium: 51, hard: 62 }
// easy → 45 hints, medium → 30 hints, hard → 19 hints

function generatePuzzle(sessionId: string, difficulty: Difficulty = 'medium') {
  const rng = makeRng(sessionSeed(sessionId || 'default'))
  const solution: Grid = Array.from({ length: 9 }, () => Array(9).fill(0))
  fillGrid(solution, rng)
  const puzzle: Grid = solution.map(row => [...row])
  const cells = shuffle(Array.from({ length: 81 }, (_, i) => i), rng)
  const remove = REMOVE_COUNT[difficulty]
  for (let i = 0; i < remove; i++) {
    puzzle[Math.floor(cells[i] / 9)][cells[i] % 9] = 0
  }
  return { puzzle, solution }
}

// ── Conflict detection ────────────────────────────────────────────────────────
function hasConflict(grid: Grid, r: number, c: number): boolean {
  const val = grid[r][c]
  if (val === 0) return false
  for (let i = 0; i < 9; i++) {
    if (i !== c && grid[r][i] === val) return true
    if (i !== r && grid[i][c] === val) return true
  }
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++)
      if ((br + dr !== r || bc + dc !== c) && grid[br + dr][bc + dc] === val) return true
  return false
}

// ── Component ─────────────────────────────────────────────────────────────────
type Phase = 'identify' | 'ready' | 'playing' | 'waiting'
type PlayerResult = { id: string; displayName: string; time: number | null }

export default function Sudoku({ players, options, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const sessionId = (options.sessionId as string) || ''
  const userId    = (options.userId    as string) || ''

  // Identify current player: profile match → localStorage cache → null (needs picking)
  const matchedByUserId = players.find(p => p.profile_id === userId)
  const isSolo = players.length === 1

  const [myPlayerId, setMyPlayerId] = useState<string | null>(
    isSolo ? players[0].id : (matchedByUserId?.id ?? null)
  )
  const myPlayer = players.find(p => p.id === myPlayerId) ?? players[0]

  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [pageUrl,    setPageUrl]    = useState('')
  const [copied,     setCopied]     = useState(false)

  // Re-generate puzzle when difficulty changes (only allowed in 'ready' phase)
  const puzzleRef = useRef<{ puzzle: Grid; solution: Grid } | null>(null)
  if (!puzzleRef.current) puzzleRef.current = generatePuzzle(sessionId, difficulty)

  const { puzzle, solution } = puzzleRef.current

  const [phase,      setPhase]      = useState<Phase>(
    () => (isSolo || !!matchedByUserId) ? 'ready' : 'identify'
  )
  const [grid,       setGrid]       = useState<Grid>(() => puzzle.map(row => [...row]))
  const [selected,   setSelected]   = useState<[number, number] | null>(null)
  const [elapsed,    setElapsed]    = useState(0)
  const [allResults, setAllResults] = useState<PlayerResult[]>(
    () => players.map(p => ({ id: p.id, displayName: p.display_name, time: null }))
  )

  const calledComplete = useRef(false)
  const startTimeRef   = useRef(0)
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const finalTimeRef   = useRef(0)

  // On mount: store page URL and restore identity from localStorage if needed
  useEffect(() => {
    setPageUrl(window.location.href)
    if (myPlayerId || isSolo) return
    const stored = localStorage.getItem(`who-won-player-${sessionId}`)
    if (stored && players.find(p => p.id === stored)) {
      setMyPlayerId(stored)
      setPhase('ready')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return
    startTimeRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase])

  // Realtime: receive other players' completions while waiting
  useEffect(() => {
    if (!sessionId || phase !== 'waiting') return
    const supabase = createClient()
    const channel = supabase
      .channel(`sudoku-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'session_players',
        filter: `session_id=eq.${sessionId}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        const row = payload.new
        const sd  = row?.score_data
        if (sd?.completed && typeof sd.time === 'number') {
          setAllResults(prev =>
            prev.map(r => r.id === row.id ? { ...r, time: sd.time as number } : r)
          )
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, phase])

  // When all players done → call onComplete
  useEffect(() => {
    if (phase !== 'waiting' || calledComplete.current) return
    if (!allResults.every(r => r.time !== null)) return
    calledComplete.current = true
    const sorted = [...allResults].sort((a, b) => (a.time ?? 99999) - (b.time ?? 99999))
    onComplete(sorted.map((r, i) => ({ id: r.id, finalScore: r.time ?? 99999, rank: i + 1 })))
  }, [allResults, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Identify & share ─────────────────────────────────────────────────────
  function identifyAs(id: string) {
    localStorage.setItem(`who-won-player-${sessionId}`, id)
    setMyPlayerId(id)
    setPhase('ready')
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Difficulty (only usable in 'ready' phase) ─────────────────────────────
  function changeDifficulty(d: Difficulty) {
    const newPuzzle = generatePuzzle(sessionId, d)
    puzzleRef.current = newPuzzle
    setDifficulty(d)
    setGrid(newPuzzle.puzzle.map(row => [...row]))
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  function handleCellClick(r: number, c: number) {
    setSelected([r, c])
  }

  function handleInput(num: number) {
    if (phase !== 'playing' || !selected) return
    const [r, c] = selected
    if (puzzle[r][c] !== 0) return // fixed cell
    const newGrid = grid.map(row => [...row])
    newGrid[r][c] = num
    setGrid(newGrid)

    // Check if solved
    if (newGrid.every((row, ri) => row.every((val, ci) => val === solution[ri][ci]))) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      const ft = Math.floor((Date.now() - startTimeRef.current) / 1000)
      finalTimeRef.current = ft
      setElapsed(ft)
      setAllResults(prev => prev.map(r => r.id === myPlayer.id ? { ...r, time: ft } : r))
      onScoreUpdate(myPlayer.id, { completed: true, time: ft })
      setPhase('waiting')
    }
  }

  function fmt(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  // ── Cell styling helpers ───────────────────────────────────────────────────
  const isFixed   = (r: number, c: number) => puzzle[r][c] !== 0
  const isSel     = (r: number, c: number) => selected?.[0] === r && selected?.[1] === c
  const isRelated = (r: number, c: number) =>
    !!selected && !isSel(r, c) && (
      selected[0] === r ||
      selected[1] === c ||
      (Math.floor(r / 3) === Math.floor(selected[0] / 3) &&
       Math.floor(c / 3) === Math.floor(selected[1] / 3))
    )
  const isSameVal = (r: number, c: number) =>
    !!selected && grid[r][c] !== 0 && grid[r][c] === grid[selected[0]][selected[1]]
  const isErr     = (r: number, c: number) => !isFixed(r, c) && hasConflict(grid, r, c)

  function cellStyle(r: number, c: number): CSSProperties {
    let bg = '#ffffff', color = '#1f2937', fw: CSSProperties['fontWeight'] = 500
    if (isSel(r, c))   { bg = '#6366f1'; color = '#ffffff' }
    else if (isErr(r, c))     { bg = '#fee2e2'; color = '#dc2626' }
    else if (isSameVal(r, c)) { bg = '#c7d2fe'; color = '#312e81' }
    else if (isRelated(r, c)) { bg = '#eef2ff' }
    if (isFixed(r, c)) fw = 800
    return {
      background: bg, color, fontWeight: fw,
      fontSize: 'clamp(11px, 4.2vw, 18px)',
      borderRight:  c < 8 ? (c === 2 || c === 5 ? '2px solid #374151' : '1px solid #d1d5db') : undefined,
      borderBottom: r < 8 ? (r === 2 || r === 5 ? '2px solid #374151' : '1px solid #d1d5db') : undefined,
    }
  }

  // ── Render: Identify ──────────────────────────────────────────────────────
  if (phase === 'identify') {
    return (
      <div className="max-w-sm mx-auto py-10 px-4 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-5xl mb-3">👋</div>
          <h2 className="text-2xl font-black text-gray-900">Hvem er du?</h2>
          <p className="text-sm text-gray-500 mt-1">Velg navnet ditt for å fortsette</p>
        </div>
        <div className="w-full space-y-2">
          {players.map(p => (
            <button
              key={p.id}
              onClick={() => identifyAs(p.id)}
              className="w-full bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-800 font-semibold py-4 px-5 rounded-2xl transition-colors text-left flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center shrink-0">
                {p.display_name[0].toUpperCase()}
              </span>
              {p.display_name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Render: Ready ──────────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <div className="max-w-sm mx-auto py-10 px-4 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🔢</div>
          <h2 className="text-2xl font-black text-gray-900">Sudoku</h2>
          <p className="text-sm text-gray-500 mt-1">Løs brettet så raskt du kan</p>
          {players.length > 1 && (
            <p className="text-xs text-gray-400 mt-1">Alle spillere løser samme brett — best tid vinner</p>
          )}
        </div>

        {players.length > 1 && (
          <div className="w-full bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Spillere</p>
            <div className="space-y-2">
              {players.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                    ${p.id === myPlayer.id ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.id === myPlayer.id ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                  <span className="font-medium text-gray-800">{p.display_name}</span>
                  {p.id === myPlayer.id && <span className="text-xs text-indigo-400 ml-auto">deg</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share link — shown to the session owner so they can invite others */}
        {players.length > 1 && pageUrl && (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1 text-center">Inviter spillere</p>
            <p className="text-xs text-gray-400 mb-3 text-center">Del denne lenken med de andre — de åpner den på sin egen enhet</p>
            <div className="flex gap-2 items-center">
              <p className="flex-1 text-xs text-gray-500 font-mono bg-white border border-gray-200 rounded-xl px-3 py-2 truncate">{pageUrl}</p>
              <button
                onClick={copyLink}
                className={`shrink-0 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? 'Kopiert!' : 'Kopier'}
              </button>
            </div>
          </div>
        )}

        {/* Difficulty picker */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Vanskelighetsgrad</p>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => changeDifficulty(d)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors
                  ${difficulty === d
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
              >
                {d === 'easy' ? 'Lett' : d === 'medium' ? 'Middels' : 'Vanskelig'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {difficulty === 'easy' ? '45 hint' : difficulty === 'medium' ? '30 hint' : '19 hint'}
          </p>
        </div>

        <div className="w-full space-y-3">
          <button
            onClick={() => setPhase('playing')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-2xl transition-colors"
          >
            Start
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

  // ── Render: Waiting ────────────────────────────────────────────────────────
  if (phase === 'waiting') {
    const myTime = allResults.find(r => r.id === myPlayer.id)?.time ?? finalTimeRef.current
    const sorted = [...allResults].sort((a, b) => {
      if (a.time === null) return 1
      if (b.time === null) return -1
      return a.time - b.time
    })
    return (
      <div className="max-w-sm mx-auto py-10 px-4 flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-xl font-black text-gray-900">Bra jobbet!</h2>
          <p className="text-3xl font-black text-indigo-600 mt-1 tabular-nums">{fmt(myTime)}</p>
          {players.length > 1 && (
            <p className="text-sm text-gray-400 mt-2">Venter på de andre…</p>
          )}
        </div>

        {players.length > 1 && (
          <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {sorted.map((r, i) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 text-center text-base">
                    {r.time !== null ? (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`) : '⏳'}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {r.displayName}
                    {r.id === myPlayer.id && <span className="text-xs text-gray-400 ml-1">(deg)</span>}
                  </span>
                </div>
                {r.time !== null
                  ? <span className="text-sm font-bold text-green-600 tabular-nums">{fmt(r.time)}</span>
                  : <span className="text-xs text-gray-400 animate-pulse">løser…</span>
                }
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Render: Playing ────────────────────────────────────────────────────────
  return (
    <div className="select-none pb-6">
      {/* Timer bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
        <span className="text-xl font-black text-gray-900 tabular-nums">{fmt(elapsed)}</span>
        <span className="text-xs text-gray-400">{myPlayer.display_name}</span>
      </div>

      <div className="flex flex-col items-center gap-3 mt-3 px-4">
        {/* Grid */}
        <div className="w-full border-2 border-gray-700" style={{ maxWidth: 'min(calc(100vw - 2rem), 340px)' }}>
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((val, c) => (
                <button
                  key={c}
                  onClick={() => handleCellClick(r, c)}
                  className="flex-1 aspect-square flex items-center justify-center leading-none transition-colors"
                  style={cellStyle(r, c)}
                >
                  {val !== 0 ? val : ''}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Number pad */}
        <div
          className="w-full grid grid-cols-5 gap-1.5"
          style={{ maxWidth: 'min(calc(100vw - 2rem), 340px)' }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => handleInput(n)}
              className="h-12 bg-white border-2 border-gray-200 rounded-xl text-lg font-black text-gray-800 hover:border-indigo-400 hover:bg-indigo-50 active:scale-95 transition-all"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleInput(0)}
            className="h-12 bg-white border-2 border-gray-200 rounded-xl text-base font-bold text-gray-400 hover:border-red-300 hover:bg-red-50 active:scale-95 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Abandon */}
        <button
          onClick={() => { if (confirm('Avbryt? Ingen resultater lagres.')) onAbandon() }}
          className="w-full border border-gray-200 text-gray-400 text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors mt-1"
          style={{ maxWidth: 'min(calc(100vw - 2rem), 340px)' }}
        >
          Avbryt
        </button>
      </div>
    </div>
  )
}
