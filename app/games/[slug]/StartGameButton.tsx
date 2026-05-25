'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GAME_OPTIONS } from '@/lib/games'
import { useLocale } from '@/components/LanguageProvider'
import { tp } from '@/lib/i18n'
import type { GameMeta } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface Props {
  game: GameMeta
  user: User | null
}

interface PlayerEntry {
  id: string
  name: string
  type: 'user' | 'guest' | 'new'
  guestPlayerId?: string
  email?: string
}

export default function StartGameButton({ game, user }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [players, setPlayers] = useState<PlayerEntry[]>([])
  const [guestPlayers, setGuestPlayers] = useState<Array<{ id: string; name: string }>>([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadedGuests, setLoadedGuests] = useState(false)
  const gameOptionDefs = GAME_OPTIONS[game.id] ?? []
  const [gameOptions, setGameOptions] = useState<Record<string, boolean>>(
    Object.fromEntries(gameOptionDefs.map(o => [o.key, o.default]))
  )

  async function handleOpen() {
    if (!user) { router.push('/login'); return }
    setOpen(true)
    if (!loadedGuests) {
      const supabase = createClient()
      const { data } = await supabase.from('guest_players').select('id, name').eq('owner_id', user.id).order('name')
      setGuestPlayers(data ?? [])
      setLoadedGuests(true)
      // Auto-add current user
      setPlayers([{ id: user.id, name: user.user_metadata?.full_name ?? 'You', type: 'user' }])
    }
  }

  function addGuest(guest: { id: string; name: string }) {
    if (players.find(p => p.guestPlayerId === guest.id)) return
    setPlayers(prev => [...prev, { id: crypto.randomUUID(), name: guest.name, type: 'guest', guestPlayerId: guest.id }])
  }

  function addNew() {
    if (!newName.trim()) return
    setPlayers(prev => [...prev, { id: crypto.randomUUID(), name: newName.trim(), type: 'new', email: newEmail.trim() || undefined }])
    setNewName('')
    setNewEmail('')
  }

  function removePlayer(id: string) {
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  async function startGame() {
    if (players.length < game.min_players) return
    setLoading(true)
    const supabase = createClient()

    // Create any new guest players first
    const newGuests = players.filter(p => p.type === 'new')
    const guestIds: Record<string, string> = {}
    for (const ng of newGuests) {
      const { data } = await supabase.from('guest_players').insert({ owner_id: user!.id, name: ng.name, ...(ng.email ? { email: ng.email } : {}) }).select('id').single()
      if (data) guestIds[ng.id] = data.id
    }

    // Create session
    const { data: session, error } = await supabase.from('sessions').insert({ game_id: game.id, created_by: user!.id, options: gameOptions }).select('id').single()
    if (error || !session) { setLoading(false); return }

    // Add session players
    const sessionPlayers = players.map(p => ({
      session_id: session.id,
      profile_id: p.type === 'user' ? user!.id : null,
      guest_player_id: p.type === 'guest' ? p.guestPlayerId : p.type === 'new' ? guestIds[p.id] : null,
      display_name: p.name,
      elo_before: 1000,
    }))
    await supabase.from('session_players').insert(sessionPlayers)

    router.push(`/games/${game.id}/play/${session.id}`)
  }

  if (!game.active) return null

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
      >
        {t.game.startGame}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Start {game.name}</h2>
            <p className="text-sm text-gray-500 mb-5">{game.min_players}–{game.max_players} {t.game.players}</p>

            {/* Current players */}
            <div className="space-y-2 mb-4">
              {players.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800">{p.name}</span>
                  {p.type !== 'user' && (
                    <button onClick={() => removePlayer(p.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                  )}
                </div>
              ))}
            </div>

            {/* Add saved guests */}
            {guestPlayers.filter(g => !players.find(p => p.guestPlayerId === g.id)).length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">{t.game.yourPlayers}</p>
                <div className="flex flex-wrap gap-2">
                  {guestPlayers.filter(g => !players.find(p => p.guestPlayerId === g.id)).map(g => (
                    <button
                      key={g.id}
                      onClick={() => addGuest(g)}
                      className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                    >
                      + {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add new player */}
            {players.length < game.max_players && (
              <div className="mb-5 space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addNew()}
                    placeholder={t.game.addPlayerName}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button onClick={addNew} disabled={!newName.trim()} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors">
                    {t.game.add}
                  </button>
                </div>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder={t.game.emailOptional}
                  title={t.game.emailHint}
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 text-xs text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300"
                />
              </div>
            )}

            {/* Game options */}
            {gameOptionDefs.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">{t.game.rulesOption}</p>
                <div className="space-y-2">
                  {gameOptionDefs.map(opt => (
                    <label key={opt.key} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gameOptions[opt.key] ?? opt.default}
                        onChange={e => setGameOptions(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                {t.game.cancel}
              </button>
              <button
                onClick={startGame}
                disabled={players.length < game.min_players || loading}
                className="flex-1 bg-indigo-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40"
              >
                {loading ? t.game.starting : tp(t.game.startWith, { n: players.length })}
              </button>
            </div>

            {players.length < game.min_players && (
              <p className="text-xs text-center text-gray-400 mt-2">
                {tp(t.game.needAtLeast, { n: game.min_players })}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
