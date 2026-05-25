import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import FeedbackButton from '@/components/FeedbackButton'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Who Won? — Track scores for any game',
  description: 'The social scoreboard for physical games. Track scores, compete with friends, and see how you rank globally.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 font-sans antialiased">
        <Navbar user={user} />
        <main>{children}</main>
        <FeedbackButton />
      </body>
    </html>
  )
}
