'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/components/LanguageProvider'
import { GAMES } from '@/lib/games'

interface PlayerEntry {
  id: string
  name: string
  type: 'user' | 'guest' | 'new'
  guestPlayerId?: string
}

interface Props {
  userId: string
  userName: string
  savedGuests: Array<{ id: string; name: string }>
}

export default function NewChallengeForm({ userId, userName, savedGuests }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const tc = t.challenge

  const [name, setName] = useState('')
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [players, setPlayers] = useState<PlayerEntry[]>([
    { id: userId, name: userName, type: 'user' },
  ])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  const activeGames = GAMES.filter(g => g.active)

  function toggleGame(gameId: string) {
    setSelectedGames(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    )
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

  async function handleStart() {
    if (!name.trim() || selectedGames.length < 2 || players.length < 4) return
    setLoading(true)
    const supabase = createClient()

    // Create guest players for "new" entries
    const newGuests = players.filter(p => p.type === 'new')
    const guestIds: Record<string, string> = {}
    for (const ng of newGuests) {
      const { data } = await supabase.from('guest_players').insert({ owner_id: userId, name: ng.name }).select('id').single()
      if (data) guestIds[ng.id] = data.id
    }

    // Create challenge
    const { data: challenge, error } = await supabase
      .from('challenges')
      .insert({ name: name.trim(), created_by: userId })
      .select('id').single()
    if (error || !challenge) { setLoading(false); return }

    // Create challenge_players
    const playerInserts = players.map(p => ({
      challenge_id: challenge.id,
      display_name: p.name,
      profile_id: p.type === 'user' ? userId : null,
      guest_player_id: p.type === 'guest' ? p.guestPlayerId : p.type === 'new' ? guestIds[p.id] : null,
    }))
    await supabase.from('challenge_players').insert(playerInserts)

    // Create challenge_games
    const gameInserts = selectedGames.map((gameId, i) => ({
      challenge_id: challenge.id,
      game_id: gameId,
      order_index: i,
    }))
    await supabase.from('challenge_games').insert(gameInserts)

    router.push(`/challenges/${challenge.id}`)
  }

  const canStart = name.trim().length > 0 && selectedGames.length >= 2 && players.length >= 4

  return (
    <div className="space-y-8">
      <Link href="/challenges" className="text-sm text-gray-400 hover:text-gray-600">{tc.backToChallenge.replace('←', '').trim() === '' ? '← Challenges' : tc.backToChallenge}</Link>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{tc.name}</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={tc.namePlaceholder}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Game selection */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {tc.pickGames}
          {selectedGames.length < 2 && <span className="ml-2 text-xs text-gray-400 font-normal">{tc.minGames}</span>}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {activeGames.map(g => {
            const selected = selectedGames.includes(g.id)
            return (
              <button
                key={g.id}
                onClick={() => toggleGame(g.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                  selected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                }`}
              >
                <span className="text-base">{g.icon}</span>
                <span className="truncate">{g.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Players */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {tc.pickPlayers}
          {players.length < 4 && <span className="ml-2 text-xs text-gray-400 font-normal">{tc.minPlayers}</span>}
        </p>

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

        {savedGuests.filter(g => !players.find(p => p.guestPlayerId === g.id)).length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">{t.game.yourPlayers}</p>
            <div className="flex flex-wrap gap-2">
              {savedGuests.filter(g => !players.find(p => p.guestPlayerId === g.id)).map(g => (
                <button key={g.id} onClick={() => addGuest(g)}
                  className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                  + {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNew()}
            placeholder={t.tournament.addPlayer}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={addNew} disabled={!newName.trim()}
            className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-40">
            {t.game.add}
          </button>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!canStart || loading}
        className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors"
      >
        {loading ? tc.starting : tc.start}
      </button>
    </div>
  )
}
