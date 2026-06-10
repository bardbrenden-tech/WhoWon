'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/components/LanguageProvider'

interface FeedbackButtonProps {
  gameId?: string
}

export default function FeedbackButton({ gameId }: FeedbackButtonProps) {
  const { t } = useLocale()
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
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, message, gameId, pagePath: pathname }),
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
        title={t.feedback.title}
      >
        <span>💬</span> {t.feedback.button}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            {sent ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-2">🙏</p>
                <p className="font-semibold text-gray-800">{t.feedback.thanks}</p>
                <p className="text-sm text-gray-500 mt-1">{t.feedback.thanksSub}</p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-900 mb-4">{t.feedback.title}</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bug">{t.feedback.catBug}</option>
                    <option value="feature">{t.feedback.catFeature}</option>
                    <option value="design">{t.feedback.catDesign}</option>
                    <option value="rules">{t.feedback.catRules}</option>
                    <option value="other">{t.feedback.catOther}</option>
                  </select>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={t.feedback.placeholder}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      {t.feedback.cancel}
                    </button>
                    <button type="submit" disabled={!message.trim() || loading} className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40">
                      {loading ? t.feedback.sending : t.feedback.send}
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
