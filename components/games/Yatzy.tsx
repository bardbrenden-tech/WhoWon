'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'
import { useLocale } from '@/components/LanguageProvider'

type ScoreKey = 'ones'|'twos'|'threes'|'fours'|'fives'|'sixes'|'pair'|'twoPairs'|'threeOfKind'|'fourOfKind'|'fullHouse'|'smallStraight'|'largeStraight'|'chance'|'yatzy'

type CellConfig = { type: 'select'; options: number[] } | { type: 'fixed'; value: number }

const CONFIG: Record<ScoreKey, CellConfig> = {
  ones:          { type: 'select', options: [0,1,2,3,4,5] },
  twos:          { type: 'select', options: [0,2,4,6,8,10] },
  threes:        { type: 'select', options: [0,3,6,9,12,15] },
  fours:         { type: 'select', options: [0,4,8,12,16,20] },
  fives:         { type: 'select', options: [0,5,10,15,20,25] },
  sixes:         { type: 'select', options: [0,6,12,18,24,30] },
  pair:          { type: 'select', options: [0,2,4,6,8,10] },
  twoPairs:      { type: 'select', options: [0,6,8,10,12,14,16,18,20,22] },
  threeOfKind:   { type: 'select', options: [0,3,6,9,12,15] },
  fourOfKind:    { type: 'select', options: [0,4,8,12,16,20] },
  fullHouse:     { type: 'select', options: [0,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28] },
  smallStraight: { type: 'fixed', value: 15 },
  largeStraight: { type: 'fixed', value: 20 },
  chance:        { type: 'select', options: [0,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30] },
  yatzy:         { type: 'fixed', value: 50 },
}

const UPPER_KEYS: ScoreKey[] = ['ones','twos','threes','fours','fives','sixes']
const LOWER_ROWS: { key: ScoreKey; bold?: boolean }[] = [
  {key:'pair'},{key:'twoPairs'},
  {key:'threeOfKind'},{key:'fourOfKind'},
  {key:'fullHouse'},{key:'smallStraight'},
  {key:'largeStraight'},{key:'chance'},
  {key:'yatzy',bold:true},
]

const EMPTY: Record<ScoreKey,string> = {ones:'',twos:'',threes:'',fours:'',fives:'',sixes:'',pair:'',twoPairs:'',threeOfKind:'',fourOfKind:'',fullHouse:'',smallStraight:'',largeStraight:'',chance:'',yatzy:''}

function upperSum(s: Record<ScoreKey,string>) {
  return (['ones','twos','threes','fours','fives','sixes'] as ScoreKey[]).reduce((a,k)=>a+(parseInt(s[k])||0),0)
}
function bonus(sum: number) { return sum >= 63 ? 50 : 0 }
function lowerSum(s: Record<ScoreKey,string>) {
  return (['pair','twoPairs','threeOfKind','fourOfKind','fullHouse','smallStraight','largeStraight','chance','yatzy'] as ScoreKey[]).reduce((a,k)=>a+(parseInt(s[k])||0),0)
}
function total(s: Record<ScoreKey,string>) { const u=upperSum(s); return u+bonus(u)+lowerSum(s) }
function isComplete(s: Record<ScoreKey,string>) { return (Object.keys(EMPTY) as ScoreKey[]).every(k=>s[k]!=='') }

function ScoreCell({ config, value, onChange }: { config: CellConfig; value: string; onChange: (v:string)=>void }) {
  if (config.type==='fixed') return (
    <div className="w-full h-full flex">
      <div className="flex-1 flex items-center justify-center cursor-pointer hover:bg-green-50 text-gray-400 text-sm select-none" onClick={()=>onChange(config.value.toString())}>{config.value}</div>
      <div className="flex-1 flex items-center justify-center cursor-pointer hover:bg-red-50 text-gray-300 text-xs border-l border-gray-200 select-none" onClick={()=>onChange('0')}>✕</div>
    </div>
  )
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} className="w-full h-full text-center text-sm focus:outline-none bg-transparent cursor-pointer py-0.5" style={{textAlignLast:'center'}}>
      <option value=""></option>
      {config.options.map(o=><option key={o} value={o.toString()}>{o}</option>)}
    </select>
  )
}

export default function Yatzy({ players, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const { t } = useLocale()
  const sc = t.scorecard
  const LABEL: Record<ScoreKey, string> = {
    ones: sc.ones, twos: sc.twos, threes: sc.threes, fours: sc.fours, fives: sc.fives, sixes: sc.sixes,
    pair: sc.onePair, twoPairs: sc.twoPairs, threeOfKind: sc.threeOfKind, fourOfKind: sc.fourOfKind,
    fullHouse: sc.fullHouse, smallStraight: sc.smallStraight, largeStraight: sc.largeStraight,
    chance: sc.chance, yatzy: sc.yatzy,
  }
  const UPPER = UPPER_KEYS.map(key => ({ key, label: LABEL[key] }))
  const LOWER = LOWER_ROWS.map(r => ({ ...r, label: LABEL[r.key] }))
  const [scores, setScores] = useState<Record<string,Record<ScoreKey,string>>>(() =>
    Object.fromEntries(players.map(p => {
      const saved = p.score_data as Record<string, string> | null | undefined
      return [p.id, { ...EMPTY, ...(saved || {}) }]
    }))
  )
  const fillCount = (s: Record<ScoreKey,string>) => (Object.keys(EMPTY) as ScoreKey[]).filter(k=>s[k]!=='').length
  const minFills = Math.min(...players.map(p=>fillCount(scores[p.id]??EMPTY)))
  const currentPlayerId = players.find(p=>fillCount(scores[p.id]??EMPTY)===minFills)?.id

  function updateScore(playerId: string, key: ScoreKey, val: string) {
    if (fillCount(scores[playerId]??EMPTY)!==minFills) return
    setScores(prev=>{
      const next={...prev,[playerId]:{...prev[playerId],[key]:val}}
      onScoreUpdate(playerId, next[playerId])
      return next
    })
  }

  const allDone = players.every(p=>isComplete(scores[p.id]??EMPTY))
  function handleFinish() {
    const results=players.map(p=>({id:p.id,finalScore:total(scores[p.id]??EMPTY),rank:0}))
    results.sort((a,b)=>b.finalScore-a.finalScore)
    results.forEach((r,i)=>{r.rank=i+1})
    onComplete(results)
  }

  const tdI='border border-gray-300 p-0 h-7'
  const tdC='border border-gray-300 px-1 py-0.5 text-center text-sm font-semibold bg-gray-100'
  const tdT='border border-gray-300 px-1 py-1 text-center text-sm font-black bg-gray-300'
  const tdL='border border-gray-300 px-2 py-0.5 text-sm whitespace-nowrap'

  return (
    <div className="py-4 px-2">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="border-collapse w-full" style={{minWidth:`${148+players.length*68}px`}}>
            <thead>
              <tr>
                <th className="border border-gray-300 px-2 py-1 text-left text-xs font-normal bg-gray-50 w-36"></th>
                {players.map(p=>(
                  <th key={p.id} className={`border border-gray-300 px-1 py-1 text-center text-sm font-bold w-16 ${p.id===currentPlayerId?'bg-indigo-50 text-indigo-800':'bg-gray-50'}`}>
                    {p.display_name}
                    {p.id===currentPlayerId&&<div className="text-xs font-normal text-indigo-400">{t.game.yourTurn}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {UPPER.map(({key,label})=>(
                <tr key={key}>
                  <td className={tdL}>{label}</td>
                  {players.map(p=>{
                    const s=scores[p.id]??EMPTY; const filled=s[key]!==''; const active=p.id===currentPlayerId&&!filled
                    return (
                      <td key={p.id} className={`${tdI} ${!filled&&!active?'bg-gray-50':''}`}>
                        {filled?<div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-700">{s[key]==='0'?<span className="text-gray-400">✕</span>:s[key]}</div>
                          :active?<ScoreCell config={CONFIG[key]} value="" onChange={v=>updateScore(p.id,key,v)}/>
                          :<div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <td className={tdC}>{sc.sum}</td>
                {players.map(p=>{const s=upperSum(scores[p.id]??EMPTY);return<td key={p.id} className={tdC}>{s>0?s:''}</td>})}
              </tr>
              <tr>
                <td className={tdC}>{sc.bonus} (50)</td>
                {players.map(p=>{const s=upperSum(scores[p.id]??EMPTY);const b=bonus(s);const m=63-s;return<td key={p.id} className={`${tdC} ${b?'text-green-700':''}`}>{b?'50':s>0&&m>0?<span className="text-gray-400 text-xs">-{m}</span>:''}</td>})}
              </tr>
              {LOWER.map(({key,label,bold})=>(
                <tr key={key}>
                  <td className={tdL}><span className={bold?'font-bold':''}>{label}</span></td>
                  {players.map(p=>{
                    const s=scores[p.id]??EMPTY; const filled=s[key]!==''; const active=p.id===currentPlayerId&&!filled
                    return (
                      <td key={p.id} className={`${tdI} ${!filled&&!active?'bg-gray-50':''}`}>
                        {filled?<div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-700">{s[key]==='0'?<span className="text-gray-400">✕</span>:s[key]}</div>
                          :active?<ScoreCell config={CONFIG[key]} value="" onChange={v=>updateScore(p.id,key,v)}/>
                          :<div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <td className={tdT}>{sc.total}</td>
                {players.map(p=>{const tot=total(scores[p.id]??EMPTY);return<td key={p.id} className={tdT}>{tot>0?tot:''}</td>})}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button onClick={()=>{ if(!allDone){if(confirm(t.game.abandoning))onAbandon();return} handleFinish()}} className="w-full bg-indigo-600 text-white py-3 font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            {allDone?t.game.completeGame:t.game.finishEarly}
          </button>
        </div>
      </div>
    </div>
  )
}
