import type { CSSProperties } from 'react'
import type { Row } from './types.ts'

const tableStyle: CSSProperties = { borderCollapse: 'collapse', minWidth: '24rem' }
const cellStyle: CSSProperties = {
  border: '1px solid #ccc',
  padding: '0.4rem 0.75rem',
  textAlign: 'left',
}
const headerStyle: CSSProperties = { ...cellStyle, background: '#f3f3f3' }

/** Generic table: columns come from the first row's keys, one <tr> per row. */
function DataTable({ rows }: { rows: Row[] }) {
  const columns = Object.keys(rows[0] ?? {})

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
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col} style={cellStyle}>
                {row[col]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default DataTable
