import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServerT } from '@/lib/i18n-server'
import PageBanner from '@/components/PageBanner'
import NewChallengeForm from './NewChallengeForm'

export default async function NewChallengePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { t } = await getServerT()

  const [{ data: guestPlayers }] = await Promise.all([
    supabase.from('guest_players').select('id, name').eq('owner_id', user.id).order('name'),
  ])

  return (
    <div>
      <PageBanner title={`🎯 ${t.challenge.newChallenge}`} subtitle="" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <NewChallengeForm
          userId={user.id}
          userName={user.user_metadata?.full_name ?? 'You'}
          savedGuests={guestPlayers ?? []}
        />
      </div>
    </div>
  )
}
