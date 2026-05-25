import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n-server'
import Navbar from '@/components/Navbar'
import FeedbackButton from '@/components/FeedbackButton'
import { LanguageProvider } from '@/components/LanguageProvider'
import { Analytics } from '@vercel/analytics/next'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Who Won? — Track scores for any game',
  description: 'The social scoreboard for physical games. Track scores, compete with friends, and see how you rank globally.',
  metadataBase: new URL('https://who-won.com'),
  openGraph: {
    title: 'Who Won? — Track scores for any game',
    description: 'The social scoreboard for physical games. Track scores, compete with friends, and see how you rank globally.',
    url: 'https://who-won.com',
    siteName: 'Who Won?',
    type: 'website',
  },
  alternates: {
    canonical: 'https://who-won.com',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()

  return (
    <html lang={locale} className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 font-sans antialiased">
        <LanguageProvider initialLocale={locale}>
          <Navbar user={user} />
          <main>{children}</main>
          <FeedbackButton />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
