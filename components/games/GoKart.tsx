'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'
import { useLocale } from '@/components/LanguageProvider'

// Parse a lap time into seconds. Accepts "42.85" (seconds) or "1:02.5" (mm:ss.ms).
// Returns null if the input can't be understood.
function parseTime(raw: string): number | null {
  const s = raw.trim()
  if (!s) return null
  if (s.includes(':')) {
    const [mm, ss] = s.split(':')
    const m = parseInt(mm, 10)
    const sec = parseFloat(ss)
    if (isNaN(m) || isNaN(sec)) return null
    return m * 60 + sec
  }
  const sec = parseFloat(s.replace(',', '.'))
  return isNaN(sec) ? null : sec
}

function formatTime(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    const s = (seconds - m * 60).toFixed(2).padStart(5, '0')
    return `${m}:${s}`
  }
  return `${seconds.toFixed(2)}s`
}

export default function GoKart({ players, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const { t } = useLocale()
  const [times, setTimes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const p of players) {
      const saved = p.score_data?.time as number | undefined
      if (typeof saved === 'number') init[p.id] = String(saved)
    }
    return init
  })

  const parsed = players.map(p => ({ p, secs: parseTime(times[p.id] ?? '') }))
  const allFilled = parsed.every(x => x.secs !== null)

  // Leaderboard preview — fastest (lowest) first.
  const ranked = [...parsed]
    .filter(x => x.secs !== null)
    .sort((a, b) => (a.secs as number) - (b.secs as number))

  function update(id: string, value: string) {
    const next = { ...times, [id]: value }
    setTimes(next)
    const secs = parseTime(value)
    if (secs !== null) onScoreUpdate(id, { time: secs })
  }

  function complete() {
    if (!allFilled) return
    const sorted = parsed
      .map(x => ({ id: x.p.id, secs: x.secs as number }))
      .sort((a, b) => a.secs - b.secs)
    let rank = 1
    onComplete(sorted.map((r, i) => {
      if (i > 0 && sorted[i - 1].secs < r.secs) rank = i + 1
      return { id: r.id, finalScore: r.secs, rank }
    }))
  }

  return (
    <div className="max-w-sm mx-auto py-8 px-4 flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="text-5xl mb-3">🏎️</div>
        <h2 className="text-2xl font-black text-gray-900">{t.play.goKartTitle}</h2>
        <p className="text-sm text-gray-500 mt-1">{t.play.goKartSubtitle}</p>
      </div>

      {/* Time inputs */}
      <div className="w-full space-y-3">
        {players.map(p => {
          const secs = parseTime(times[p.id] ?? '')
          return (
            <div key={p.id} className="flex items-center gap-3">
              <span className="flex-1 font-bold text-gray-900 truncate">{p.display_name}</span>
              <input
                type="text"
                inputMode="decimal"
                value={times[p.id] ?? ''}
                onChange={e => update(p.id, e.target.value)}
                placeholder="42.85"
                className={`w-32 text-right border-2 rounded-xl px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                  times[p.id] && secs === null ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
            </div>
          )
        })}
        <p className="text-xs text-gray-400">{t.play.goKartHint}</p>
      </div>

      {/* Leaderboard preview */}
      {ranked.length > 0 && (
        <div className="w-full space-y-1">
          {ranked.map((r, i) => (
            <div key={r.p.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-400 text-xs w-6">{i === 0 ? '🏆' : `${i + 1}.`}</span>
              <span className="font-semibold text-gray-800 flex-1">{r.p.display_name}</span>
              <span className="font-mono text-gray-500 text-xs">{formatTime(r.secs as number)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Submit */}
      <div className="w-full space-y-2">
        <button
          onClick={complete}
          disabled={!allFilled}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-2xl transition-colors disabled:opacity-40"
        >
          {t.play.recordResult}
        </button>
        <button
          onClick={() => { if (confirm(t.play.confirmAbandonShort)) onAbandon() }}
          className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
        >
          {t.game.cancel}
        </button>
      </div>
    </div>
  )
}
