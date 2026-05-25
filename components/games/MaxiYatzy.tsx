'use client'
import { useState, useEffect } from 'react'
import type { GameComponentProps } from '@/lib/types'

type ScoreKey =
  | 'enere' | 'toere' | 'treere' | 'firere' | 'femmere' | 'seksere'
  | 'par1' | 'par2' | 'par3' | 'like3' | 'like4' | 'like5'
  | 'litenStraight' | 'storStraight' | 'fullStraight'
  | 'hytte' | 'hus' | 'tarn' | 'sjanse' | 'maxiyatzy'

type CellConfig = { type: 'select'; options: number[] } | { type: 'fixed'; value: number }

const CONFIG: Record<ScoreKey, CellConfig> = {
  enere:         { type: 'select', options: [0,1,2,3,4,5,6] },
  toere:         { type: 'select', options: [0,2,4,6,8,10,12] },
  treere:        { type: 'select', options: [0,3,6,9,12,15,18] },
  firere:        { type: 'select', options: [0,4,8,12,16,20,24] },
  femmere:       { type: 'select', options: [0,5,10,15,20,25,30] },
  seksere:       { type: 'select', options: [0,6,12,18,24,30,36] },
  par1:          { type: 'select', options: [0,2,4,6,8,10,12] },
  par2:          { type: 'select', options: [0,6,8,10,12,14,16,18,20,22] },
  par3:          { type: 'select', options: [0,12,14,16,18,20,22,24,26,28,30] },
  like3:         { type: 'select', options: [0,3,6,9,12,15,18] },
  like4:         { type: 'select', options: [0,4,8,12,16,20,24] },
  like5:         { type: 'select', options: [0,5,10,15,20,25,30] },
  litenStraight: { type: 'fixed', value: 15 },
  storStraight:  { type: 'fixed', value: 20 },
  fullStraight:  { type: 'fixed', value: 21 },
  hytte:         { type: 'select', options: [0,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28] },
  hus:           { type: 'select', options: [0,9,12,15,18,21,24,27,30,33] },
  tarn:          { type: 'select', options: [0,8,10,12,14,16,18,20,22,24,26,28,30,32,34] },
  sjanse:        { type: 'select', options: [0,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36] },
  maxiyatzy:     { type: 'fixed', value: 100 },
}

const UPPER: { key: ScoreKey; label: string }[] = [
  { key: 'enere', label: 'Ones' }, { key: 'toere', label: 'Twos' }, { key: 'treere', label: 'Threes' },
  { key: 'firere', label: 'Fours' }, { key: 'femmere', label: 'Fives' }, { key: 'seksere', label: 'Sixes' },
]
const LOWER: { key: ScoreKey; label: string; sub?: string; bold?: boolean }[] = [
  { key: 'par1', label: '1 Pair' }, { key: 'par2', label: '2 Pairs' }, { key: 'par3', label: '3 Pairs' },
  { key: 'like3', label: '3 of a Kind' }, { key: 'like4', label: '4 of a Kind' }, { key: 'like5', label: '5 of a Kind' },
  { key: 'litenStraight', label: 'Small Straight' }, { key: 'storStraight', label: 'Large Straight' },
  { key: 'fullStraight', label: 'Full Straight' },
  { key: 'hytte', label: 'House', sub: '2+3' }, { key: 'hus', label: 'Full House', sub: '3+3' }, { key: 'tarn', label: 'Tower', sub: '2+4' },
  { key: 'sjanse', label: 'Chance' }, { key: 'maxiyatzy', label: 'Maxi Yatzy', bold: true },
]
const EMPTY: Record<ScoreKey, string> = {
  enere:'',toere:'',treere:'',firere:'',femmere:'',seksere:'',
  par1:'',par2:'',par3:'',like3:'',like4:'',like5:'',
  litenStraight:'',storStraight:'',fullStraight:'',hytte:'',hus:'',tarn:'',sjanse:'',maxiyatzy:'',
}

function upperSum(s: Record<ScoreKey, string>) {
  return (['enere','toere','treere','firere','femmere','seksere'] as ScoreKey[]).reduce((a,k) => a+(parseInt(s[k])||0), 0)
}
function bonus(sum: number) { return sum >= 84 ? 100 : 0 }
function lowerSum(s: Record<ScoreKey, string>) {
  return (['par1','par2','par3','like3','like4','like5','litenStraight','storStraight','fullStraight','hytte','hus','tarn','sjanse','maxiyatzy'] as ScoreKey[]).reduce((a,k) => a+(parseInt(s[k])||0), 0)
}
function total(s: Record<ScoreKey, string>) { const u=upperSum(s); return u+bonus(u)+lowerSum(s) }
function isComplete(s: Record<ScoreKey, string>) { return (Object.keys(EMPTY) as ScoreKey[]).every(k => s[k] !== '') }

function ScoreCell({ config, value, onChange }: { config: CellConfig; value: string; onChange: (v:string) => void }) {
  if (config.type === 'fixed') return (
    <div className="w-full h-full flex">
      <div className="flex-1 flex items-center justify-center cursor-pointer hover:bg-green-50 text-gray-400 text-sm select-none" onClick={() => onChange(config.value.toString())} title={`${config.value} pts`}>{config.value}</div>
      <div className="flex-1 flex items-center justify-center cursor-pointer hover:bg-red-50 text-gray-300 text-xs border-l border-gray-200 select-none" onClick={() => onChange('0')} title="Scratch (0)">✕</div>
    </div>
  )
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-full text-center text-sm focus:outline-none bg-transparent cursor-pointer py-0.5" style={{textAlignLast:'center'}}>
      <option value=""></option>
      {config.options.map(o => <option key={o} value={o.toString()}>{o}</option>)}
    </select>
  )
}

export default function MaxiYatzy({ players, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const [scores, setScores] = useState<Record<string, Record<ScoreKey, string>>>(() =>
    Object.fromEntries(players.map(p => {
      const saved = p.score_data as Record<string, string> | null | undefined
      return [p.id, { ...EMPTY, ...(saved || {}) }]
    }))
  )

  const fillCount = (s: Record<ScoreKey, string>) => (Object.keys(EMPTY) as ScoreKey[]).filter(k => s[k] !== '').length
  const minFills = Math.min(...players.map(p => fillCount(scores[p.id] ?? EMPTY)))
  const currentPlayerId = players.find(p => fillCount(scores[p.id] ?? EMPTY) === minFills)?.id

  function updateScore(playerId: string, key: ScoreKey, val: string) {
    const currentFills = fillCount(scores[playerId] ?? EMPTY)
    if (currentFills !== minFills) return
    setScores(prev => {
      const next = { ...prev, [playerId]: { ...prev[playerId], [key]: val } }
      onScoreUpdate(playerId, next[playerId])
      return next
    })
  }

  const allDone = players.every(p => isComplete(scores[p.id] ?? EMPTY))

  function handleFinish() {
    const results = players.map(p => ({ id: p.id, finalScore: total(scores[p.id] ?? EMPTY), rank: 0 }))
    results.sort((a,b) => b.finalScore - a.finalScore)
    results.forEach((r,i) => { r.rank = i+1 })
    onComplete(results)
  }

  const tdI = 'border border-gray-300 p-0 h-7'
  const tdC = 'border border-gray-300 px-1 py-0.5 text-center text-sm font-semibold bg-gray-100'
  const tdT = 'border border-gray-300 px-1 py-1 text-center text-sm font-black bg-gray-300'
  const tdL = 'border border-gray-300 px-2 py-0.5 text-sm whitespace-nowrap'

  return (
    <div className="py-4 px-2">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="border-collapse w-full" style={{minWidth:`${148+players.length*68}px`}}>
            <thead>
              <tr>
                <th className="border border-gray-300 px-2 py-1 text-left text-xs font-normal bg-gray-50 w-36"></th>
                {players.map(p => (
                  <th key={p.id} className={`border border-gray-300 px-1 py-1 text-center text-sm font-bold w-16 ${p.id===currentPlayerId ? 'bg-indigo-50 text-indigo-800' : 'bg-gray-50'}`}>
                    {p.display_name}
                    {p.id===currentPlayerId && <div className="text-xs font-normal text-indigo-400">your turn</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {UPPER.map(({key,label}) => (
                <tr key={key}>
                  <td className={tdL}>{label}</td>
                  {players.map(p => {
                    const s = scores[p.id] ?? EMPTY
                    const filled = s[key] !== ''
                    const active = p.id===currentPlayerId && !filled
                    return (
                      <td key={p.id} className={`${tdI} ${!filled&&!active?'bg-gray-50':''}`}>
                        {filled ? <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-700">{s[key]==='0'?<span className="text-gray-400">✕</span>:s[key]}</div>
                          : active ? <ScoreCell config={CONFIG[key]} value="" onChange={v=>updateScore(p.id,key,v)} />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <td className={tdC}>Sum</td>
                {players.map(p => { const s=upperSum(scores[p.id]??EMPTY); return <td key={p.id} className={tdC}>{s>0?s:''}</td> })}
              </tr>
              <tr>
                <td className={tdC}>Bonus</td>
                {players.map(p => {
                  const s=upperSum(scores[p.id]??EMPTY); const b=bonus(s); const m=84-s
                  return <td key={p.id} className={`${tdC} ${b?'text-green-700':''}`}>{b?'100':s>0&&m>0?<span className="text-gray-400 text-xs">-{m}</span>:''}</td>
                })}
              </tr>
              {LOWER.map(({key,label,sub,bold}) => (
                <tr key={key}>
                  <td className={tdL}><span className={bold?'font-bold':''}>{label}</span>{sub&&<span className="text-xs text-gray-400 ml-1">{sub}</span>}</td>
                  {players.map(p => {
                    const s=scores[p.id]??EMPTY; const filled=s[key]!==''; const active=p.id===currentPlayerId&&!filled
                    return (
                      <td key={p.id} className={`${tdI} ${!filled&&!active?'bg-gray-50':''}`}>
                        {filled ? <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-700">{s[key]==='0'?<span className="text-gray-400">✕</span>:s[key]}</div>
                          : active ? <ScoreCell config={CONFIG[key]} value="" onChange={v=>updateScore(p.id,key,v)} />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <td className={tdT}>Total</td>
                {players.map(p => { const t=total(scores[p.id]??EMPTY); return <td key={p.id} className={tdT}>{t>0?t:''}</td> })}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => { if (!allDone) { if (confirm('Abandon game? No ratings will change.')) onAbandon(); return } handleFinish() }}
            className="w-full bg-indigo-600 text-white py-3 font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {allDone ? 'Complete Game' : 'Finish Early'}
          </button>
        </div>
      </div>
    </div>
  )
}
