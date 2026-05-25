'use client'
import { useState } from 'react'
import type { GameRules } from '@/lib/rules'

interface Labels {
  badge: string
  quickStart: string
  fullRules: string
  show: string
  hide: string
}

export default function RulesAccordion({ rules, labels }: { rules: GameRules; labels: Labels }) {
  const [showFull, setShowFull] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="font-bold text-gray-900 mb-4">{labels.badge}</h2>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{labels.quickStart}</h3>
        <ul className="space-y-1.5">
          {rules.quickStart.map((rule, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-600">
              <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setShowFull(!showFull)}
        className="text-sm text-indigo-600 font-medium hover:underline"
      >
        {showFull ? labels.hide : labels.show}
      </button>

      {showFull && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{labels.fullRules}</h3>
          <ul className="space-y-1.5">
            {rules.full.map((rule, i) => (
              <li key={i} className={`text-sm ${rule.startsWith('  ') ? 'pl-4 text-gray-500' : 'text-gray-600'}`}>
                {rule.startsWith('  ') ? rule.trim() : (
                  <span className="flex gap-2">
                    <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                    <span>{rule}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
