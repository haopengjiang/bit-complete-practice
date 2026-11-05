import type { Row } from './types.ts'

export type SortDirection = 'asc' | 'desc'

// Plain decimals only: "-3", "2.5", ".5". Not "", "1,200", "0x10", "1e3".
const NUMERIC = /^[-+]?(\d+(\.\d*)?|\.\d+)$/

/** True if the trimmed cell is a plain decimal number. */
export function isNumericCell(value: string): boolean {
  return NUMERIC.test(value.trim())
}

/** Ascending comparison of two non-empty cells: numbers by value, before text; text naturally. */
export function compareCells(a: string, b: string): number {
  const aNum = isNumericCell(a)
  const bNum = isNumericCell(b)
  if (aNum && bNum) return Number(a) - Number(b)
  if (aNum !== bNum) return aNum ? -1 : 1
  return a.trim().localeCompare(b.trim(), undefined, { numeric: true, sensitivity: 'base' })
}

/** A row paired with its original position, used as a stable React key across sorts. */
export type KeyedRow = { key: number; row: Row }

/** Record each row's original position. Wraps instead of adding a field, so no column can collide. */
export function withKeys(rows: Row[]): KeyedRow[] {
  return rows.map((row, index) => ({ key: index, row }))
}

/** Return a sorted copy of keyed rows by `column`; empty cells stay last in both directions. */
export function sortKeyedRows(items: KeyedRow[], column: string, direction: SortDirection): KeyedRow[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...items].sort((ka, kb) => {
    const a = ka.row[column] ?? ''
    const b = kb.row[column] ?? ''
    const aEmpty = a.trim() === ''
    const bEmpty = b.trim() === ''
    if (aEmpty || bEmpty) return Number(aEmpty) - Number(bEmpty) // empties last, not flipped
    return sign * compareCells(a, b)
  })
}

/** Return a sorted copy of rows by `column` (convenience wrapper without keys). */
export function sortRows(rows: Row[], column: string, direction: SortDirection): Row[] {
  return sortKeyedRows(withKeys(rows), column, direction).map((k) => k.row)
}
