'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteChallenge } from './actions'

interface Props {
  challengeId: string
  challengeName: string
}

export default function DeleteChallengeButton({ challengeId, challengeName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Slett turneringen "${challengeName}"?\n\nDette fjerner alle grener og resultater. Kan ikke angres.`)) return
    setLoading(true)
    try {
      await deleteChallenge(challengeId)
      router.refresh()
    } catch {
      alert('Noe gikk galt. Prøv igjen.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
      title="Slett turnering"
    >
      {loading ? (
        <span className="text-xs">...</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  )
}
