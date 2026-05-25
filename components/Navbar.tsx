'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useLocale } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'

interface NavbarProps {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()
  const { t } = useLocale()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/games', label: t.nav.games },
    { href: '/leaderboard', label: t.nav.leaderboard },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <Image src="/images/Logo.png" alt="Who Won?" width={120} height={48} className="object-contain h-10 w-auto" priority />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith(l.href)
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center ring-2 ring-offset-1 ring-yellow-300 hover:ring-yellow-400 hover:scale-105 transition-all shadow-md"
                style={{ backgroundColor: '#F5C518', color: '#1a1a1a' }}
              >
                {user.user_metadata?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                    {t.nav.myProfile}
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    {t.nav.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t.nav.signIn}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
