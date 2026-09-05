// Parsing of pasted player lists.
//
// People paste from very different places — a Word/Outlook table, an Excel
// column, a chat message — so the parser accepts all the shapes we have
// actually seen rather than demanding one format:
//   * one name per line
//   * two columns (first name TAB last name) pasted from a spreadsheet
//   * several names on one line separated by comma or semicolon
// Header rows, numbering ("1. Ola") and duplicates are dropped.

const HEADER_WORDS = new Set([
  'fornavn', 'etternavn', 'navn', 'name', 'names', 'first name', 'last name',
  'firstname', 'lastname', 'spiller', 'spillere', 'player', 'players',
  'deltaker', 'deltakere', 'nr', 'no', '#',
])

export interface ParsedPlayers {
  /** New, unique names ready to be added, in the order they appeared. */
  names: string[]
  /** Names skipped because they already exist or repeat within the paste. */
  duplicates: string[]
}

function clean(raw: string): string {
  return raw
    // Strip list numbering: "1. Ola", "2) Kari", "3 - Per"
    .replace(/^\s*\d+\s*[.)\-–]\s*/, '')
    // Collapse all whitespace (incl. non-breaking spaces from Outlook)
    .replace(/[\s ]+/g, ' ')
    .trim()
}

function isHeader(name: string): boolean {
  return HEADER_WORDS.has(name.toLowerCase())
}

export function parsePlayerNames(text: string, existing: string[] = []): ParsedPlayers {
  const seen = new Set(existing.map(n => n.trim().toLowerCase()))
  const names: string[] = []
  const duplicates: string[] = []

  for (const rawLine of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (!rawLine.trim()) continue

    let candidates: string[]
    if (rawLine.includes('\t')) {
      // Spreadsheet paste: the cells on one row belong to ONE person
      // ("Andreas<TAB>Kulik"), so join them instead of splitting into two.
      const cells = rawLine.split('\t').map(c => clean(c)).filter(Boolean)
      // A header ROW ("Fornavn<TAB>Etternavn") only looks like a header cell by
      // cell — once joined it would sail past the header check below.
      if (cells.length > 0 && cells.every(isHeader)) continue
      candidates = [cells.join(' ')]
    } else if (/[,;]/.test(rawLine)) {
      candidates = rawLine.split(/[,;]/)
    } else {
      candidates = [rawLine]
    }

    for (const candidate of candidates) {
      const name = clean(candidate)
      if (!name || isHeader(name)) continue

      const key = name.toLowerCase()
      if (seen.has(key)) { duplicates.push(name); continue }
      seen.add(key)
      names.push(name)
    }
  }

  return { names, duplicates }
}
