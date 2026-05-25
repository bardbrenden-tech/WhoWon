import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGame } from '@/lib/games'
import GamePlay from './GamePlay'

interface Props {
  params: Promise<{ slug: string; sessionId: string }>
}

export default async function PlayPage({ params }: Props) {
  const { slug, sessionId } = await params
  const game = getGame(slug)
  if (!game) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('*, session_players(*)')
    .eq('id', sessionId)
    .single()

  if (!session) notFound()
  if (session.status === 'completed') redirect(`/games/${slug}`)

  return <GamePlay game={game} session={session} userId={user.id} />
}
