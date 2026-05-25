import { cookies } from 'next/headers'
import type { Locale } from './i18n'
import { MESSAGES, getT } from './i18n'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const val = store.get('locale')?.value
  return (val && val in MESSAGES) ? (val as Locale) : 'en'
}

export async function getServerT() {
  const locale = await getLocale()
  return { t: getT(locale), locale }
}
