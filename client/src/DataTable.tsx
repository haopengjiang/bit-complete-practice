import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { sortRows } from './sortRows.ts'
import type { SortDirection } from './sortRows.ts'
import type { Row } from './types.ts'

type Sort = { column: string; direction: SortDirection } | null

const tableStyle: CSSProperties = { borderCollapse: 'collapse', minWidth: '24rem' }
const cellStyle: CSSProperties = {
  border: '1px solid #ccc',
  padding: '0.4rem 0.75rem',
  textAlign: 'left',
}
const headerStyle: CSSProperties = { ...cellStyle, background: '#f3f3f3', padding: 0 }
const headerButtonStyle: CSSProperties = {
  all: 'unset',
  boxSizing: 'border-box',
  display: 'block',
  width: '100%',
  padding: '0.4rem 0.75rem',
  fontWeight: 'bold',
  cursor: 'pointer',
}
const emptyStyle: CSSProperties = { ...cellStyle, color: '#666', fontStyle: 'italic' }

/** Next sort when a header is clicked: asc -> desc -> none; a new column starts at asc. */
function nextSort(current: Sort, column: string): Sort {
  if (current?.column !== column) return { column, direction: 'asc' }
  return current.direction === 'asc' ? { column, direction: 'desc' } : null
}

/** Generic sortable table: headers from `columns` (shown even with no rows). */
function DataTable({ columns, rows }: { columns: string[]; rows: Row[] }) {
  const [sort, setSort] = useState<Sort>(null)

  // Derived from props + sort state; recomputed only when either changes.
  const visibleRows = useMemo(
    () => (sort ? sortRows(rows, sort.column, sort.direction) : rows),
    [rows, sort],
  )

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          {columns.map((col) => {
            const direction = sort?.column === col ? sort.direction : null
            return (
              <th
                key={col}
                style={headerStyle}
                aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
              >
                <button
                  type="button"
                  style={headerButtonStyle}
                  onClick={() => setSort((s) => nextSort(s, col))}
                >
                  {col} {direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : ''}
                </button>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {visibleRows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={emptyStyle}>
              No rows
            </td>
          </tr>
        ) : (
          visibleRows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col} style={cellStyle}>
                  {row[col]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

export default DataTable
