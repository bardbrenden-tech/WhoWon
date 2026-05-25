import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginButton from './LoginButton'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Who Won?</h1>
        <p className="text-gray-500 text-sm mb-8">
          Track scores, build your rating, and see who the real champion is.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">
            Something went wrong. Please try again.
          </p>
        )}

        <LoginButton />

        <p className="text-xs text-gray-400 mt-6">
          By signing in you agree to our terms of service. Always free.
        </p>
      </div>
    </div>
  )
}
