import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN_EMAIL = 'bard.brenden@gmail.com'

async function getStats() {
  const supabase = createAdminClient()

  const [
    { count: totalUsers },
    { count: totalSessions },
    { count: completedSessions },
    { count: abandonedSessions },
    { count: totalFeedback },
    { count: newFeedback },
    { count: totalTournaments },
    { count: totalChallenges },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'abandoned'),
    supabase.from('feedback').select('*', { count: 'exact', head: true }),
    supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    supabase.from('challenges').select('*', { count: 'exact', head: true }),
  ])

  // Sessions last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { count: sessionsLast7 } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  // New users last 7 days
  const { count: newUsersLast7 } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  // Most popular games
  const { data: popularGames } = await supabase
    .from('sessions')
    .select('game_id')
    .eq('status', 'completed')

  const gameCounts: Record<string, number> = {}
  for (const s of popularGames ?? []) {
    gameCounts[s.game_id] = (gameCounts[s.game_id] ?? 0) + 1
  }
  const topGames = Object.entries(gameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Recent signups
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  // Recent feedback
  const { data: recentFeedback } = await supabase
    .from('feedback')
    .select('id, category, message, page_path, game_id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    totalUsers, totalSessions, completedSessions, abandonedSessions,
    totalFeedback, newFeedback, totalTournaments, totalChallenges,
    sessionsLast7, newUsersLast7, topGames, recentUsers, recentFeedback,
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: '🐛 Bug', feature: '✨ Feature', design: '🎨 Design',
  rules: '📋 Rules', other: '💬 Other',
}

function StatCard({ label, value, sub }: { label: string; value: number | null; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? 0}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Temporary: show email so we can verify the correct one
  const ALLOWED = ['bard.brenden@gmail.com', 'bard@brenden.no']
  if (!ALLOWED.includes(user.email ?? '')) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl border text-center">
        <p className="text-gray-500 text-sm mb-2">Ikke tilgang. Din innloggingsepost er:</p>
        <p className="font-mono text-gray-900 font-bold">{user.email}</p>
        <p className="text-gray-400 text-xs mt-4">Gi denne til utvikler for å få tilgang.</p>
      </div>
    )
  }

  const stats = await getStats()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin</h1>
      <p className="text-sm text-gray-400 mb-8">who-won.com dashboard</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Brukere totalt" value={stats.totalUsers} sub={`+${stats.newUsersLast7} siste 7 dager`} />
        <StatCard label="Sesjoner totalt" value={stats.totalSessions} sub={`+${stats.sessionsLast7} siste 7 dager`} />
        <StatCard label="Fullførte sesjoner" value={stats.completedSessions} />
        <StatCard label="Feedback (nye)" value={stats.newFeedback} sub={`${stats.totalFeedback} totalt`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Avbrutte sesjoner" value={stats.abandonedSessions} />
        <StatCard label="Turneringer" value={stats.totalTournaments} />
        <StatCard label="Challenges" value={stats.totalChallenges} />
        <StatCard label="Spillsesjoner fullført %" value={
          stats.totalSessions
            ? Math.round(((stats.completedSessions ?? 0) / stats.totalSessions) * 100)
            : 0
        } sub="prosent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Popular games */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">🎮 Mest populære spill</h2>
          {stats.topGames.length === 0 ? (
            <p className="text-sm text-gray-400">Ingen data ennå</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Spill</th>
                  <th className="pb-2 font-medium text-right">Sesjoner</th>
                </tr>
              </thead>
              <tbody>
                {stats.topGames.map(([gameId, count], i) => (
                  <tr key={gameId} className="border-b border-gray-50">
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2 text-gray-700 capitalize">{gameId.replace(/-/g, ' ')}</td>
                    <td className="py-2 text-right font-medium text-gray-900">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent signups */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">👤 Siste registreringer</h2>
          {!stats.recentUsers?.length ? (
            <p className="text-sm text-gray-400">Ingen brukere ennå</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentUsers.map(u => (
                <li key={u.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">{u.display_name || 'Anonym'}</span>
                  <span className="text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('nb-NO')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">💬 Siste feedback</h2>
        {!stats.recentFeedback?.length ? (
          <p className="text-sm text-gray-400">Ingen feedback ennå</p>
        ) : (
          <div className="space-y-3">
            {stats.recentFeedback.map(f => (
              <div key={f.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-indigo-600">
                    {CATEGORY_LABELS[f.category] ?? f.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {f.status === 'new' && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Ny</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(f.created_at).toLocaleDateString('nb-NO')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{f.message}</p>
                {(f.page_path || f.game_id) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {f.page_path && <span>Side: {f.page_path}</span>}
                    {f.game_id && <span className="ml-2">Spill: {f.game_id}</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
