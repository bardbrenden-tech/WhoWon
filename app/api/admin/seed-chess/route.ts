import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('games')
    .select('id')
    .eq('id', 'chess')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ message: 'chess already exists in games table' })
  }

  const { error } = await supabase.from('games').insert({
    id: 'chess',
    name: 'Sjakk',
    name_alt: 'Chess',
    category: 'board',
    description: 'Registrer utfallet av sjakkpartiet. Velg hvem som vant — eller om det ble remis.',
    min_players: 2,
    max_players: 2,
    higher_is_better: true,
    active: true,
    sort_order: 29,
    icon: '♟️',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'chess inserted successfully' })
}
