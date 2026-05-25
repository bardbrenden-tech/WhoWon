'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/components/LanguageProvider'
import { tp } from '@/lib/i18n'
import { generateRound } from '@/lib/tournament'
import type { GameMeta } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface PlayerEntry {
  id: string
  name: string
  type: 'user' | 'guest' | 'new'
  guestPlayerId?: string
}

export default function StartTournamentButton({ game, user }: { game: GameMeta; user: User | null }) {
  const router = useRouter()
  const { t } = useLocale()
  const tt = t.tournament
  const [open, setOpen] = useState(false)
  const [players, setPlayers] = useState<PlayerEntry[]>([])
  const [guestPlayers, setGuestPlayers] = useState<Array<{ id: string; name: string }>>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadedGuests, setLoadedGuests] = useState(false)

  async function handleOpen() {
    if (!user) { router.push('/login'); return }
    setOpen(true)
    if (!loadedGuests) {
      const supabase = createClient()
      const { data } = await supabase.from('guest_players').select('id, name').eq('owner_id', user.id).order('name')
      setGuestPlayers(data ?? [])
      setLoadedGuests(true)
      setPlayers([{ id: user.id, name: user.user_metadata?.full_name ?? 'You', type: 'user' }])
    }
  }

  function addGuest(guest: { id: string; name: string }) {
    if (players.find(p => p.guestPlayerId === guest.id)) return
    setPlayers(prev => [...prev, { id: crypto.randomUUID(), name: guest.name, type: 'guest', guestPlayerId: guest.id }])
  }

  function addNew() {
    if (!newName.trim()) return
    setPlayers(prev => [...prev, { id: crypto.randomUUID(), name: newName.trim(), type: 'new' }])
    setNewName('')
  }

  function removePlayer(id: string) {
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  async function startTournament() {
    if (players.length < 4) return
    setLoading(true)
    const supabase = createClient()

    const newGuests = players.filter(p => p.type === 'new')
    const guestIds: Record<string, string> = {}
    for (const ng of newGuests) {
      const { data } = await supabase.from('guest_players').insert({ owner_id: user!.id, name: ng.name }).select('id').single()
      if (data) guestIds[ng.id] = data.id
    }

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert({ game_id: game.id, created_by: user!.id })
      .select('id').single()
    if (error || !tournament) { setLoading(false); return }

    const shuffled = [...players].sort(() => Math.random() - 0.5)
    const playerInserts = shuffled.map((p, i) => ({
      tournament_id: tournament.id,
      profile_id: p.type === 'user' ? user!.id : null,
      guest_player_id: p.type === 'guest' ? p.guestPlayerId : p.type === 'new' ? guestIds[p.id] : null,
      display_name: p.name,
      seed: i,
    }))
    const { data: tPlayers } = await supabase.from('tournament_players').insert(playerInserts).select('id, seed')
    if (!tPlayers) { setLoading(false); return }

    const sorted = tPlayers.sort((a, b) => a.seed - b.seed)
    const round1 = generateRound(sorted, 1).map(m => ({ ...m, tournament_id: tournament.id }))
    await supabase.from('tournament_matches').insert(round1)

    router.push(`/tournaments/${tournament.id}`)
  }

  if (!game.active) return null

  return (
    <>
      <button
        onClick={handleOpen}
        className="border border-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
      >
        🏆 {tt.startTournament}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-1">🏆 {tt.startTournament}</h2>
            <p className="text-sm text-gray-500 mb-5">{game.name} · {tt.minPlayers}</p>

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

            {guestPlayers.filter(g => !players.find(p => p.guestPlayerId === g.id)).length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">{t.game.yourPlayers}</p>
                <div className="flex flex-wrap gap-2">
                  {guestPlayers.filter(g => !players.find(p => p.guestPlayerId === g.id)).map(g => (
                    <button key={g.id} onClick={() => addGuest(g)}
                      className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                      + {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNew()}
                placeholder={tt.addPlayer}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={addNew} disabled={!newName.trim()}
                className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-40">
                {t.game.add}
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)}
                className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50">
                {tt.cancel}
              </button>
              <button
                onClick={startTournament}
                disabled={players.length < 4 || loading}
                className="flex-1 bg-indigo-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40"
              >
                {loading ? tt.starting : tp(tt.startWith, { n: players.length })}
              </button>
            </div>

            {players.length < 4 && (
              <p className="text-xs text-center text-gray-400 mt-2">{tt.minPlayers}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
