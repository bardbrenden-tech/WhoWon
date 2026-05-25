'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/components/LanguageProvider'

interface GuestPlayer {
  id: string
  name: string
  email: string | null
  avatar_color: string
}

export default function GuestPlayersSection({ initialPlayers }: { initialPlayers: GuestPlayer[] }) {
  const { t } = useLocale()
  const [players, setPlayers] = useState(initialPlayers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function remove(id: string) {
    await supabase.from('guest_players').delete().eq('id', id)
    setPlayers(prev => prev.filter(p => p.id !== id))
    if (editingId === id) setEditingId(null)
  }

  function startEdit(player: GuestPlayer) {
    setEditingId(player.id)
    setEmailDraft(player.email ?? '')
  }

  async function saveEmail(id: string) {
    setSaving(true)
    const email = emailDraft.trim() || null
    await supabase.from('guest_players').update({ email }).eq('id', id)
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, email } : p))
    setEditingId(null)
    setSaving(false)
  }

  if (players.length === 0) {
    return <p className="text-sm text-gray-400">{t.profile.noPlayers}</p>
  }

  return (
    <div className="space-y-2">
      {players.map(gp => (
        <div key={gp.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: gp.avatar_color }}
            >
              {gp.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{gp.name}</p>
              {editingId === gp.id ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={e => setEmailDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEmail(gp.id); if (e.key === 'Escape') setEditingId(null) }}
                    placeholder={t.profile.emailPlaceholder}
                    autoFocus
                    className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={() => saveEmail(gp.id)}
                    disabled={saving}
                    className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {t.profile.save}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              ) : gp.email ? (
                <button
                  onClick={() => startEdit(gp)}
                  className="text-xs text-gray-400 hover:text-indigo-500 transition-colors truncate block max-w-full text-left"
                >
                  {gp.email}
                </button>
              ) : (
                <button
                  onClick={() => startEdit(gp)}
                  className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  {t.profile.addEmail}
                </button>
              )}
            </div>
            <button
              onClick={() => remove(gp.id)}
              className="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors shrink-0 ml-1"
              aria-label={t.profile.removeConfirm}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
