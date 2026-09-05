'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/components/LanguageProvider'
import { tp } from '@/lib/i18n'
import type { ChallengePlayer } from '@/lib/types'

interface Props {
  players: ChallengePlayer[]
}

// Renaming a challenge player is the safe way to swap someone out after the
// brackets have been drawn: the bracket slot, its matches and any recorded
// results stay exactly where they are — only the label on the slot changes.
// Adding or removing a player would require redrawing the bracket, so that is
// deliberately not offered here.
export default function EditChallengePlayers({ players }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const tc = t.challenge

  const [open, setOpen] = useState(false)
  const [names, setNames] = useState<Record<string, string>>(
    () => Object.fromEntries(players.map(p => [p.id, p.display_name]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const changed = players.filter(p => names[p.id]?.trim() && names[p.id].trim() !== p.display_name)

  async function save() {
    if (players.some(p => !names[p.id]?.trim())) { setError(tc.nameEmpty); return }
    if (changed.length === 0) return

    setError('')
    setSaving(true)
    const supabase = createClient()

    for (const p of changed) {
      const newName = names[p.id].trim()
      const { error: cpErr } = await supabase
        .from('challenge_players')
        .update({ display_name: newName })
        .eq('id', p.id)
      if (cpErr) { setError(cpErr.message); setSaving(false); return }

      // Every bracket this challenge has already drawn carries its own copy of
      // the name, so they all have to follow.
      const { error: tpErr } = await supabase
        .from('tournament_players')
        .update({ display_name: newName })
        .eq('challenge_player_id', p.id)
      if (tpErr) { setError(tpErr.message); setSaving(false); return }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ✏️ {tc.editPlayers}
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-gray-900">✏️ {tc.editPlayers}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{tc.editPlayersHint}</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none shrink-0"
          aria-label={tc.cancel}
        >
          ×
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto mb-3 pr-1">
        {players.map((p, i) => {
          const isChanged = names[p.id]?.trim() && names[p.id].trim() !== p.display_name
          return (
            <div key={p.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-6 text-right shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={names[p.id] ?? ''}
                onChange={e => setNames(prev => ({ ...prev, [p.id]: e.target.value }))}
                className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isChanged ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200'
                }`}
              />
            </div>
          )
        })}
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <button
        onClick={save}
        disabled={changed.length === 0 || saving}
        className="w-full bg-indigo-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
      >
        {saving ? tc.saving : saved ? `✓ ${tc.savedChanges}` : tp(tc.saveChanges, { n: changed.length })}
      </button>
    </div>
  )
}
