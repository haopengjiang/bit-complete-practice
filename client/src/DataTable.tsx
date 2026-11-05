import type { CSSProperties } from 'react'
import type { Row } from './types.ts'

const tableStyle: CSSProperties = { borderCollapse: 'collapse', minWidth: '24rem' }
const cellStyle: CSSProperties = {
  border: '1px solid #ccc',
  padding: '0.4rem 0.75rem',
  textAlign: 'left',
}
const headerStyle: CSSProperties = { ...cellStyle, background: '#f3f3f3' }
const emptyStyle: CSSProperties = { ...cellStyle, color: '#666', fontStyle: 'italic' }

/** Generic table: headers from `columns` (shown even with no rows), one <tr> per row. */
function DataTable({ columns, rows }: { columns: string[]; rows: Row[] }) {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} style={headerStyle}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={emptyStyle}>
              No rows
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
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
