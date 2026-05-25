import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGame } from '@/lib/games'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

interface SessionPlayer {
  id: string
  display_name: string
  final_score: number | null
  rank: number | null
  elo_before: number
  elo_after: number | null
  score_data: Record<string, unknown>
}

// Golf scorecard colours matching real scorecards
function holeColor(strokes: number, par: number): string {
  const diff = strokes - par
  if (diff <= -2) return 'bg-blue-100 text-blue-800 font-black'   // Eagle or better
  if (diff === -1) return 'bg-green-100 text-green-800 font-bold'  // Birdie
  if (diff === 0)  return 'text-gray-700'                          // Par
  if (diff === 1)  return 'bg-red-50 text-red-600'                 // Bogey
  return 'bg-red-100 text-red-700 font-bold'                       // Double+
}

function GolfScorecard({ players }: { players: SessionPlayer[] }) {
  // Get pars from first player's score_data (same for all)
  const first = players[0]?.score_data as { pars?: number[]; courseName?: string } | undefined
  const pars: number[] = (first?.pars as number[]) ?? []
  const courseName: string = (first?.courseName as string) ?? ''
  const holeCount = pars.length

  if (holeCount === 0) return null

  const front = pars.slice(0, 9)
  const back = pars.slice(9, 18)
  const frontPar = front.reduce((a, b) => a + b, 0)
  const backPar = back.reduce((a, b) => a + b, 0)
  const totalPar = frontPar + backPar

  function fmtVsPar(n: number): string {
    if (n === 0) return 'E'
    return n > 0 ? `+${n}` : String(n)
  }

  function renderSection(sectionPars: number[], offset: number, label: string, sectionPar: number) {
    return (
      <>
        {/* Par row */}
        <tr className="bg-gray-50 text-xs text-gray-500">
          <td className="sticky left-0 bg-gray-50 px-2 py-1.5 font-semibold whitespace-nowrap">Par</td>
          {sectionPars.map((p, i) => (
            <td key={i} className="px-1.5 py-1.5 text-center min-w-[2rem]">{p}</td>
          ))}
          <td className="px-2 py-1.5 text-center font-bold border-l border-gray-200">{sectionPar}</td>
        </tr>
        {/* Player rows */}
        {players.map(player => {
          const sd = player.score_data as { holes?: number[]; handicap?: number } | undefined
          const holes: number[] = (sd?.holes as number[]) ?? []
          const hcp: number = (sd?.handicap as number) ?? 0
          const sectionHoles = holes.slice(offset, offset + sectionPars.length)
          const sectionTotal = sectionHoles.reduce((a, b) => a + b, 0)
          const sectionVsPar = sectionTotal - sectionPar

          return (
            <tr key={player.id + label} className="border-t border-gray-100 text-sm">
              <td className="sticky left-0 bg-white px-2 py-1.5 font-semibold text-gray-800 whitespace-nowrap max-w-[8rem] truncate">
                {player.display_name}
                {hcp > 0 && <span className="text-xs text-gray-400 ml-1">({hcp})</span>}
              </td>
              {sectionPars.map((p, i) => {
                const strokes = sectionHoles[i]
                if (strokes === undefined) return <td key={i} className="px-1.5 py-1.5 text-center text-gray-300 min-w-[2rem]">—</td>
                return (
                  <td key={i} className={`px-1.5 py-1.5 text-center min-w-[2rem] rounded ${holeColor(strokes, p)}`}>
                    {strokes}
                  </td>
                )
              })}
              <td className="px-2 py-1.5 text-center border-l border-gray-200 font-bold">
                <span className={sectionVsPar < 0 ? 'text-green-600' : sectionVsPar > 0 ? 'text-red-500' : 'text-gray-500'}>
                  {sectionTotal}
                </span>
              </td>
            </tr>
          )
        })}
      </>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900">Scorecard</h2>
        {courseName && <span className="text-xs text-gray-400">{courseName}</span>}
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wide">
              <th className="sticky left-0 bg-white px-2 pb-1 text-left font-medium">Spiller</th>
              {front.map((_, i) => (
                <th key={i} className="px-1.5 pb-1 text-center font-medium min-w-[2rem]">{i + 1}</th>
              ))}
              <th className="px-2 pb-1 text-center font-medium border-l border-gray-200">Ut</th>
              {back.length > 0 && back.map((_, i) => (
                <th key={i} className="px-1.5 pb-1 text-center font-medium min-w-[2rem]">{i + 10}</th>
              ))}
              {back.length > 0 && <th className="px-2 pb-1 text-center font-medium border-l border-gray-200">Inn</th>}
              <th className="px-2 pb-1 text-center font-bold border-l border-gray-200">Tot</th>
              <th className="px-2 pb-1 text-center font-medium text-gray-400">+/-</th>
            </tr>
          </thead>
          <tbody>
            {/* Front 9 */}
            {renderSection(front, 0, 'front', frontPar)}

            {/* Back 9 (18-hole only) */}
            {back.length > 0 && (
              <>
                <tr><td colSpan={99} className="pt-3" /></tr>
                {renderSection(back, 9, 'back', backPar)}
              </>
            )}

            {/* Total row */}
            <tr className="border-t-2 border-gray-200 bg-gray-50 text-sm font-bold">
              <td className="sticky left-0 bg-gray-50 px-2 py-2 text-gray-500">Total</td>
              {front.map((_, i) => <td key={i} className="min-w-[2rem]" />)}
              <td className="px-2 py-2 text-center border-l border-gray-200 text-gray-500">{frontPar}</td>
              {back.length > 0 && back.map((_, i) => <td key={i} className="min-w-[2rem]" />)}
              {back.length > 0 && <td className="px-2 py-2 text-center border-l border-gray-200 text-gray-500">{backPar}</td>}
              <td className="px-2 py-2 text-center border-l border-gray-200 text-gray-700">{totalPar}</td>
              <td className="px-2 py-2 text-center text-gray-400">E</td>
            </tr>
            {players.map(player => {
              const sd = player.score_data as { holes?: number[]; handicap?: number } | undefined
              const holes: number[] = (sd?.holes as number[]) ?? []
              const hcp: number = (sd?.handicap as number) ?? 0
              const effectiveHcp = holeCount === 9 ? Math.round(hcp / 2) : hcp
              const gross = holes.reduce((a, b) => a + b, 0)
              const vsPar = gross - totalPar
              const net = gross - effectiveHcp

              return (
                <tr key={player.id + 'total'} className="border-t border-gray-200 text-sm font-bold">
                  <td className="sticky left-0 bg-white px-2 py-2 text-gray-800 whitespace-nowrap">{player.display_name}</td>
                  {front.map((_, i) => <td key={i} className="min-w-[2rem]" />)}
                  <td className="px-2 py-2 text-center border-l border-gray-200 font-bold text-gray-700">
                    {holes.slice(0, 9).reduce((a, b) => a + b, 0) || ''}
                  </td>
                  {back.length > 0 && back.map((_, i) => <td key={i} className="min-w-[2rem]" />)}
                  {back.length > 0 && (
                    <td className="px-2 py-2 text-center border-l border-gray-200 font-bold text-gray-700">
                      {holes.slice(9, 18).reduce((a, b) => a + b, 0) || ''}
                    </td>
                  )}
                  <td className="px-2 py-2 text-center border-l border-gray-200 text-gray-900">{gross || '—'}</td>
                  <td className={`px-2 py-2 text-center text-xs ${vsPar < 0 ? 'text-green-600' : vsPar > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {gross ? fmtVsPar(vsPar) : '—'}
                    {hcp > 0 && gross ? (
                      <span className="block text-gray-400">{net} netto</span>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-3 flex-wrap">
        <span className="text-xs text-gray-400 flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-blue-100 text-blue-800 text-center leading-4 text-[10px] font-black">3</span> Eagle−</span>
        <span className="text-xs text-gray-400 flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-green-100 text-green-800 text-center leading-4 text-[10px] font-bold">4</span> Birdie</span>
        <span className="text-xs text-gray-400 flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-red-50 text-red-600 text-center leading-4 text-[10px]">5</span> Bogey</span>
        <span className="text-xs text-gray-400 flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-red-100 text-red-700 text-center leading-4 text-[10px] font-bold">6</span> Double+</span>
      </div>
    </div>
  )
}

export default async function SessionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('*, session_players(*)')
    .eq('id', id)
    .single()

  if (!session) notFound()

  const game = getGame(session.game_id)
  const players: SessionPlayer[] = [...(session.session_players as SessionPlayer[])].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/profile" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
        ← Tilbake til profil
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{game?.icon ?? '🎮'}</span>
          <h1 className="text-2xl font-black text-gray-900">{game?.name ?? session.game_id}</h1>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            session.status === 'completed' ? 'bg-green-100 text-green-700' :
            session.status === 'abandoned' ? 'bg-gray-100 text-gray-500' :
            'bg-amber-100 text-amber-700'
          }`}>
            {session.status === 'completed' ? 'Fullført' : session.status === 'abandoned' ? 'Avbrutt' : 'Aktiv'}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {new Date(session.created_at).toLocaleDateString('nb-NO', { dateStyle: 'long' })}
          {session.completed_at && (
            <> · {new Date(session.completed_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}</>
          )}
        </p>
      </div>

      {/* Final results */}
      {session.status === 'completed' && players.some(p => p.rank) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">Resultat</h2>
          <div className="space-y-2">
            {players.filter(p => p.rank).map((p, i) => {
              const eloChange = p.elo_after != null ? p.elo_after - p.elo_before : null
              return (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border ${i === 0 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'}`}>
                  <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${p.rank}.`}</span>
                  <span className="flex-1 font-semibold text-gray-900">{p.display_name}</span>
                  {p.final_score != null && (
                    <span className="text-sm font-bold text-gray-600">{p.final_score}</span>
                  )}
                  {eloChange != null && (
                    <span className={`text-xs font-bold ml-2 ${eloChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {eloChange >= 0 ? '+' : ''}{eloChange} rating
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Golf-specific full scorecard */}
      {session.game_id === 'golf' && <GolfScorecard players={players} />}
    </div>
  )
}
