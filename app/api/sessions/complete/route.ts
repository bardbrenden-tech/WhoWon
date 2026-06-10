import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateElo } from '@/lib/elo'

interface FinalResult { id: string; finalScore: number; rank: number }

// Server-authoritative session completion. Computes Elo and writes ratings
// using the service-role key, so the `ratings` table no longer needs to be
// writable by the browser (it is locked to service-role only via RLS).
// Authorization: only the session's creator may complete it.
export async function POST(req: NextRequest) {
  let body: { sessionId?: string; results?: FinalResult[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { sessionId, results } = body
  if (!sessionId || !Array.isArray(results)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Authenticate the caller against their session cookie.
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Load the session and its players, and verify ownership.
  const { data: session, error: sErr } = await admin
    .from('sessions')
    .select('id, game_id, status, created_by, session_players(id, profile_id, guest_player_id)')
    .eq('id', sessionId)
    .single()
  if (sErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const nowIso = new Date().toISOString()

  // Atomically claim completion. Only the request that flips active -> completed
  // proceeds to apply Elo; concurrent finishers (e.g. multi-device Sudoku) get a
  // no-op response. This prevents double-counting ratings.
  const { data: claimed } = await admin
    .from('sessions')
    .update({ status: 'completed', completed_at: nowIso })
    .eq('id', sessionId)
    .eq('status', 'active')
    .select('id')
  if (!claimed || claimed.length === 0) {
    return NextResponse.json({ alreadyCompleted: true, eloChanges: {} })
  }

  const players = (session.session_players ?? []) as {
    id: string; profile_id: string | null; guest_player_id: string | null
  }[]

  // Only trust results for players that actually belong to this session.
  const validIds = new Set(players.map(p => p.id))
  const cleanResults = results.filter(r => r && validIds.has(r.id))

  // Current ratings keyed by session_player id.
  const ratingByPlayer: Record<string, { rating: number; gamesPlayed: number; wins: number }> = {}
  for (const sp of players) {
    const col = sp.profile_id ? 'profile_id' : 'guest_player_id'
    const val = sp.profile_id ?? sp.guest_player_id
    const { data } = await admin
      .from('ratings')
      .select('rating, games_played, wins')
      .eq('game_id', session.game_id)
      .eq(col, val)
      .maybeSingle()
    ratingByPlayer[sp.id] = {
      rating: data?.rating ?? 1000,
      gamesPlayed: data?.games_played ?? 0,
      wins: data?.wins ?? 0,
    }
  }

  const eloInputs = players.map(sp => {
    const r = cleanResults.find(x => x.id === sp.id)
    return {
      id: sp.id,
      rating: ratingByPlayer[sp.id].rating,
      gamesPlayed: ratingByPlayer[sp.id].gamesPlayed,
      rank: r?.rank ?? players.length,
    }
  })
  const eloResults = calculateElo(eloInputs)
  const changes: Record<string, number> = {}

  for (const r of eloResults) {
    const sp = players.find(p => p.id === r.id)!
    const result = cleanResults.find(f => f.id === r.id)
    changes[r.id] = r.change

    await admin.from('session_players').update({
      final_score: result?.finalScore ?? null,
      rank: result?.rank ?? null,
      elo_before: r.oldRating,
      elo_after: r.newRating,
    }).eq('id', r.id)

    const col = sp.profile_id ? 'profile_id' : 'guest_player_id'
    const isWin = result?.rank === 1 ? 1 : 0

    await admin.from('ratings').upsert({
      profile_id: sp.profile_id,
      guest_player_id: sp.guest_player_id,
      game_id: session.game_id,
      rating: r.newRating,
      games_played: ratingByPlayer[r.id].gamesPlayed + 1,
      wins: ratingByPlayer[r.id].wins + isWin,
      updated_at: nowIso,
    }, { onConflict: col + ',game_id', ignoreDuplicates: false })
  }

  return NextResponse.json({ eloChanges: changes })
}
