'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { getT, type Messages } from '@/lib/i18n'

interface LanguageContextValue {
  locale: Locale
  t: Messages
  setLocale: (l: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  t: getT('en'),
  setLocale: () => {},
})

export function LanguageProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const router = useRouter()

  const setLocale = useCallback((l: Locale) => {
    document.cookie = `locale=${l};path=/;max-age=31536000;samesite=lax`
    setLocaleState(l)
    router.refresh()
  }, [router])

  return (
    <LanguageContext.Provider value={{ locale, t: getT(locale), setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLocale() {
  return useContext(LanguageContext)
}
