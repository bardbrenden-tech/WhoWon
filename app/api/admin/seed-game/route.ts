import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Idempotent endpoint to insert missing games into the Supabase games table.
// Safe to run multiple times. Visit /api/admin/seed-game to run.
export async function GET() {
  const supabase = createAdminClient()

  const games = [
    {
      id: 'sudoku',
      name: 'Sudoku',
      name_alt: null as string | null,
      category: 'puzzle',
      description: 'Solve the 9×9 puzzle as fast as you can. Everyone gets the same board — lowest time wins.',
      min_players: 1,
      max_players: 8,
      higher_is_better: false,
      active: true,
      sort_order: 70,
      icon: '🔢',
    },
    {
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
    },
    {
      id: 'padel',
      name: 'Padel',
      name_alt: null as string | null,
      category: 'sport',
      description: 'Registrer sett i en padelkamp. Legg inn hvem som vant hvert sett — best av 3. Fungerer for både single og double.',
      min_players: 2,
      max_players: 4,
      higher_is_better: true,
      active: true,
      sort_order: 54,
      icon: '🎾',
    },
  ]

  const results: string[] = []

  for (const game of games) {
    const { data: existing } = await supabase
      .from('games')
      .select('id')
      .eq('id', game.id)
      .maybeSingle()

    if (existing) {
      results.push(`${game.id}: already exists`)
      continue
    }

    const { error } = await supabase.from('games').insert(game)

    if (error) {
      // If category value violates a DB constraint, fall back to 'board'
      if (error.message.includes('category') || error.message.includes('violates')) {
        const { error: err2 } = await supabase.from('games').insert({ ...game, category: 'board' })
        results.push(err2 ? `${game.id}: ERROR – ${err2.message}` : `${game.id}: inserted with category=board`)
      } else {
        results.push(`${game.id}: ERROR – ${error.message}`)
      }
    } else {
      results.push(`${game.id}: inserted`)
    }
  }

  return NextResponse.json({ results })
}
