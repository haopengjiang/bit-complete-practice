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

/** Return a sorted copy of rows by `column`; empty cells stay last in both directions. */
export function sortRows(rows: Row[], column: string, direction: SortDirection): Row[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...rows].sort((ra, rb) => {
    const a = ra[column] ?? ''
    const b = rb[column] ?? ''
    const aEmpty = a.trim() === ''
    const bEmpty = b.trim() === ''
    if (aEmpty || bEmpty) return Number(aEmpty) - Number(bEmpty) // empties last, not flipped
    return sign * compareCells(a, b)
  })
}
