'use client'
import { useState, useRef, useEffect } from 'react'
import { LOCALES, type Locale } from '@/lib/i18n'
import { useLocale } from './LanguageProvider'

const FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  no: '🇳🇴',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Select language"
      >
        <span>{FLAGS[locale]}</span>
        <span className="hidden sm:inline">{LOCALES[locale]}</span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
          {(Object.entries(LOCALES) as [Locale, string][]).map(([code, label]) => (
            <button
              key={code}
              onClick={() => { setLocale(code); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50 ${locale === code ? 'text-indigo-600 font-semibold' : 'text-gray-700'}`}
            >
              <span>{FLAGS[code]}</span>
              <span>{label}</span>
              {locale === code && <span className="ml-auto text-indigo-500">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
