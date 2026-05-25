import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const CATEGORY_LABELS: Record<string, string> = {
  bug: '🐛 Something is broken',
  feature: '✨ Feature request',
  design: '🎨 Design / UX',
  rules: '📋 Wrong rules',
  other: '💬 Other',
}

export async function POST(req: NextRequest) {
  const { category, message, gameId, pagePath } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'No message' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('feedback').insert({
    profile_id: user?.id ?? null,
    game_id: gameId ?? null,
    page_path: pagePath ?? null,
    category,
    message: message.trim(),
  })

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'bard.brenden@gmail.com',
    subject: `[who-won] ${CATEGORY_LABELS[category] ?? category}`,
    html: `
      <h2>New feedback on who-won.com</h2>
      <p><strong>Category:</strong> ${CATEGORY_LABELS[category] ?? category}</p>
      <p><strong>Page:</strong> ${pagePath ?? '–'}</p>
      <p><strong>Game:</strong> ${gameId ?? '–'}</p>
      <p><strong>User:</strong> ${user?.email ?? 'Not logged in'}</p>
      <hr />
      <p>${message.trim().replace(/\n/g, '<br/>')}</p>
    `,
  })

  return NextResponse.json({ ok: true })
}
