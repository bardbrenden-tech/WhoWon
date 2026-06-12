'use client'
import { useState } from 'react'
import type { GameComponentProps } from '@/lib/types'
import { useLocale } from '@/components/LanguageProvider'
import { tp } from '@/lib/i18n'

const NUMBERS = [20, 19, 18, 17, 16, 15, 'bull'] as const
type CricketNumber = typeof NUMBERS[number]
const BULL_VALUE = 25

interface CricketState {
  marks: Record<string, number>
  score: number
}

function markDisplay(n: number) {
  if (n === 0) return ''
  if (n === 1) return '/'
  if (n === 2) return 'X'
  return '⊗'
}

export default function DartsCricket({ players, onScoreUpdate, onComplete, onAbandon }: GameComponentProps) {
  const { t } = useLocale()
  const [state, setState] = useState<Record<string, CricketState>>(() =>
    Object.fromEntries(players.map(p => {
      const saved = p.score_data as Partial<CricketState>
      return [p.id, {
        marks: saved.marks ?? Object.fromEntries(NUMBERS.map(n => [String(n), 0])),
        score: saved.score ?? 0,
      }]
    }))
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [turnMarks, setTurnMarks] = useState<Record<string, number>>(
    Object.fromEntries(NUMBERS.map(n => [String(n), 0]))
  )

  const currentPlayer = players[currentIdx % players.length]

  function isClosed(playerId: string, num: CricketNumber) {
    return state[playerId].marks[String(num)] >= 3
  }

  function allClosed(playerId: string) {
    return NUMBERS.every(n => isClosed(playerId, n))
  }

  function addMark(num: CricketNumber) {
    const key = String(num)
    const total = Object.values(turnMarks).reduce((s, v) => s + v, 0)
    if (total >= 3) return
    setTurnMarks(prev => ({ ...prev, [key]: Math.min(3, (prev[key] ?? 0) + 1) }))
  }

  function confirmTurn() {
    const newState = { ...state }
    // Deep copy current player
    const cp = {
      marks: { ...state[currentPlayer.id].marks },
      score: state[currentPlayer.id].score,
    }

    for (const num of NUMBERS) {
      const key = String(num)
      const added = turnMarks[key] ?? 0
      if (added === 0) continue

      const currentMarks = cp.marks[key]
      const newMarks = Math.min(3, currentMarks + added)
      const overflow = (currentMarks + added) - 3

      cp.marks[key] = newMarks

      // Score overflow marks if player closed the number
      if (newMarks === 3 && overflow > 0) {
        // Check if all opponents have also closed it
        const opponentsClosed = players
          .filter(p => p.id !== currentPlayer.id)
          .every(p => state[p.id].marks[key] >= 3)
        if (!opponentsClosed) {
          const faceValue = num === 'bull' ? BULL_VALUE : (num as number)
          cp.score += faceValue * overflow
        }
      } else if (newMarks >= 3 && currentMarks >= 3) {
        // Already closed, all marks score
        const opponentsClosed = players
          .filter(p => p.id !== currentPlayer.id)
          .every(p => state[p.id].marks[key] >= 3)
        if (!opponentsClosed) {
          const faceValue = num === 'bull' ? BULL_VALUE : (num as number)
          cp.score += faceValue * added
        }
      }
    }

    newState[currentPlayer.id] = cp
    setState(newState)
    onScoreUpdate(currentPlayer.id, cp as unknown as Record<string, unknown>)

    // Reset turn marks
    setTurnMarks(Object.fromEntries(NUMBERS.map(n => [String(n), 0])))
    setCurrentIdx(i => i + 1)
  }

  function isGameOver() {
    return players.some(p => {
      if (!allClosed(p.id)) return false
      return players.every(op => op.id === p.id || state[p.id].score >= state[op.id].score)
    })
  }

  function handleFinish() {
    const results = players.map(p => ({
      id: p.id,
      finalScore: state[p.id].score + (allClosed(p.id) ? 10000 : 0),
      rank: 0,
    }))
    results.sort((a, b) => b.finalScore - a.finalScore)
    results.forEach((r, i) => { r.rank = i + 1 })
    onComplete(results)
  }

  const gameOver = isGameOver()
  const dartsUsed = Object.values(turnMarks).reduce((s, v) => s + v, 0)

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* Cricket board */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2 text-left text-xs text-gray-400">{t.play.cricketNumber}</th>
              {players.map(p => (
                <th key={p.id} className={`px-3 py-2 text-center text-xs font-medium truncate ${p.id === currentPlayer.id && !gameOver ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {p.display_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NUMBERS.map(num => {
              const allPlayersClosed = players.every(p => isClosed(p.id, num))
              return (
                <tr key={String(num)} className={`border-b border-gray-50 ${allPlayersClosed ? 'opacity-40' : ''}`}>
                  <td className="px-3 py-2 font-bold text-gray-700">{num === 'bull' ? t.play.bull : num}</td>
                  {players.map(p => {
                    const marks = state[p.id].marks[String(num)]
                    return (
                      <td key={p.id} className="px-3 py-2 text-center">
                        <span className={`text-lg font-black ${marks >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                          {markDisplay(marks) || '–'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr className="border-t-2 border-gray-200 bg-gray-50">
              <td className="px-3 py-2 text-xs font-bold text-gray-500">{t.scorecard.score}</td>
              {players.map(p => (
                <td key={p.id} className="px-3 py-2 text-center font-black text-indigo-600">{state[p.id].score}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {gameOver ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-4">
          <p className="text-2xl mb-1">🎯</p>
          <p className="font-bold text-green-800">
            {tp(t.play.playerWins, { name: players.find(p => allClosed(p.id) && players.every(op => op.id === p.id || state[p.id].score >= state[op.id].score))?.display_name ?? '' })}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">{tp(t.play.playerTurn, { name: currentPlayer.display_name })}</p>
            <span className="text-xs text-gray-400">{tp(t.play.cricketDarts, { n: dartsUsed })}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {NUMBERS.map(num => {
              const key = String(num)
              const alreadyClosed = isClosed(currentPlayer.id, num)
              const turnCount = turnMarks[key] ?? 0
              return (
                <button
                  key={key}
                  onClick={() => addMark(num)}
                  disabled={dartsUsed >= 3}
                  className={`py-2 rounded-lg text-sm font-bold border transition-colors disabled:opacity-40 ${
                    alreadyClosed
                      ? 'bg-green-50 border-green-200 text-green-600'
                      : turnCount > 0
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <div>{num === 'bull' ? t.play.bull : num}</div>
                  {turnCount > 0 && <div className="text-xs">+{turnCount}</div>}
                </button>
              )
            })}
          </div>
          <button
            onClick={confirmTurn}
            className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            {t.play.endTurn}
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => { if (confirm(t.game.abandoning)) onAbandon() }}
          className="border border-gray-300 text-gray-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {t.play.abandon}
        </button>
        <button
          onClick={() => { if (confirm(t.play.finishConfirm)) handleFinish() }}
          className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {gameOver ? t.game.completeGame : t.game.finishEarly}
        </button>
      </div>
    </div>
  )
}
