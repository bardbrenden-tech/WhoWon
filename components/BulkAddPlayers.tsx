'use client'
import { useMemo, useState } from 'react'
import { useLocale } from '@/components/LanguageProvider'
import { tp } from '@/lib/i18n'
import { parsePlayerNames } from '@/lib/parse-players'

interface Props {
  /** Names already on the list — used to skip duplicates. */
  existingNames: string[]
  onAdd: (names: string[]) => void
}

export default function BulkAddPlayers({ existingNames, onAdd }: Props) {
  const { t } = useLocale()
  const tt = t.tournament
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const parsed = useMemo(
    () => parsePlayerNames(text, existingNames),
    [text, existingNames]
  )

  function handleAdd() {
    if (parsed.names.length === 0) return
    onAdd(parsed.names)
    setText('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        📋 {tt.bulkPaste}
      </button>
    )
  }

  return (
    <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-gray-500">{tt.bulkHint}</p>
        <button
          type="button"
          onClick={() => { setOpen(false); setText('') }}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0"
          aria-label={tt.cancel}
        >
          ×
        </button>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        autoFocus
        placeholder={tt.bulkPlaceholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {text.trim().length > 0 && (
        <p className="text-xs text-gray-500">
          {tp(tt.bulkFound, { n: parsed.names.length })}
          {parsed.duplicates.length > 0 && (
            <span className="text-amber-600"> · {tp(tt.bulkDupes, { n: parsed.duplicates.length })}</span>
          )}
        </p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={parsed.names.length === 0}
        className="w-full bg-indigo-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
      >
        {tp(tt.bulkAdd, { n: parsed.names.length })}
      </button>
    </div>
  )
}
