import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGame } from '@/lib/games'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: ratings }, { data: guestPlayers }, { data: recentSessions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('ratings').select('*').eq('profile_id', user.id).order('rating', { ascending: false }),
    supabase.from('guest_players').select('*').eq('owner_id', user.id).order('name'),
    supabase.from('sessions').select('*, session_players(*)').eq('created_by', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600 text-white text-2xl font-black flex items-center justify-center shrink-0">
          {profile?.display_name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">{profile?.display_name ?? user.email}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Member since {new Date(profile?.created_at ?? user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Ratings per game */}
      {ratings && ratings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">📊 Your Ratings</h2>
          <div className="space-y-3">
            {ratings.map(r => {
              const game = getGame(r.game_id)
              return (
                <div key={r.id} className="flex items-center gap-4">
                  <span className="text-xl">{game?.icon ?? '🎮'}</span>
                  <div className="flex-1">
                    <Link href={`/games/${r.game_id}`} className="text-sm font-semibold text-gray-800 hover:text-indigo-600">{game?.name ?? r.game_id}</Link>
                    <p className="text-xs text-gray-400">{r.games_played} games · {r.wins} wins</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-indigo-600 text-lg">{r.rating}</p>
                    <p className="text-xs text-gray-400">Elo</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Guest players */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">👥 Your Players</h2>
        {guestPlayers && guestPlayers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {guestPlayers.map(gp => (
              <div key={gp.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: gp.avatar_color }}>
                  {gp.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{gp.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No saved players yet. They will be saved automatically when you start a game.</p>
        )}
      </div>

      {/* Recent sessions */}
      {recentSessions && recentSessions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-4">🕹️ Recent Games</h2>
          <div className="space-y-2">
            {recentSessions.map((s: { id: string; game_id: string; status: string; created_at: string; session_players: { display_name: string }[] }) => {
              const game = getGame(s.game_id)
              return (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-lg">{game?.icon ?? '🎮'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{game?.name ?? s.game_id}</p>
                    <p className="text-xs text-gray-400">{s.session_players.map((sp: { display_name: string }) => sp.display_name).join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
