import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// One-time endpoint to insert missing games into the Supabase games table.
// Visit /api/admin/seed-game to run.
export async function GET() {
  const supabase = createAdminClient()

  // First check what columns the games table actually has
  const { data: existing, error: checkErr } = await supabase
    .from('games')
    .select('id')
    .eq('id', 'sudoku')
    .maybeSingle()

  if (checkErr) {
    return NextResponse.json({ error: checkErr.message }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json({ message: 'sudoku already exists in games table' })
  }

  // Try inserting with category='puzzle' first, fall back to 'board'
  const gameRow = {
    id: 'sudoku',
    name: 'Sudoku',
    name_alt: null,
    category: 'puzzle',
    description: 'Solve the 9×9 puzzle as fast as you can. Everyone gets the same board — lowest time wins.',
    min_players: 1,
    max_players: 8,
    higher_is_better: false,
    active: true,
    sort_order: 70,
    icon: '🔢',
  }

  const { error: insertErr } = await supabase.from('games').insert(gameRow)

  if (insertErr) {
    // If puzzle category is invalid, try with 'board'
    if (insertErr.message.includes('category') || insertErr.message.includes('violates')) {
      const { error: err2 } = await supabase.from('games').insert({ ...gameRow, category: 'board' })
      if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })
      return NextResponse.json({ message: 'sudoku inserted with category=board' })
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'sudoku inserted successfully with category=puzzle' })
}
