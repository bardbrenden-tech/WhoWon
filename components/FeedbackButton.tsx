'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface FeedbackButtonProps {
  gameId?: string
}

export default function FeedbackButton({ gameId }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<string>('bug')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('feedback').insert({
      profile_id: user?.id ?? null,
      game_id: gameId ?? null,
      page_path: pathname,
      category,
      message: message.trim(),
    })
    setSent(true)
    setLoading(false)
    setTimeout(() => { setOpen(false); setSent(false); setMessage('') }, 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-white border border-gray-300 shadow-md text-gray-600 text-xs font-medium px-3 py-2 rounded-full hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center gap-1.5"
        title="Send feedback"
      >
        <span>💬</span> Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            {sent ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-2">🙏</p>
                <p className="font-semibold text-gray-800">Thanks for your feedback!</p>
                <p className="text-sm text-gray-500 mt-1">We review every submission.</p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-900 mb-4">Send feedback</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bug">🐛 Something is broken</option>
                    <option value="feature">✨ Feature request</option>
                    <option value="design">🎨 Design / UX</option>
                    <option value="rules">📋 Wrong rules</option>
                    <option value="other">💬 Other</option>
                  </select>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={!message.trim() || loading} className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40">
                      {loading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
