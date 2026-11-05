import { useEffect, useState } from 'react'
import DataTable from './DataTable.tsx'
import type { ParseWarning, TableData } from './types.ts'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: TableData }

/** Parse problems reported by the server (extra cells, duplicate headers). */
function Warnings({ warnings }: { warnings: ParseWarning[] }) {
  if (warnings.length === 0) return null
  return (
    <div
      role="status"
      style={{
        background: '#fff8e1',
        border: '1px solid #f0c36d',
        padding: '0.5rem 1rem',
        marginBottom: '1rem',
      }}
    >
      <strong>
        {warnings.length} warning{warnings.length === 1 ? '' : 's'} in data.md
      </strong>
      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
        {warnings.map((w, i) => (
          <li key={i}>
            Line {w.line}: {w.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Runtime check that the response body is { columns, rows, warnings }. */
function isTableData(body: unknown): body is TableData {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  return Array.isArray(b.columns) && Array.isArray(b.rows) && Array.isArray(b.warnings)
}

/** Fetches /api/data once and shows loading, error, no table, or warnings + table. */
function App() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    // Abort on unmount (also covers StrictMode's double-run in dev).
    const controller = new AbortController()

    fetch('/api/data', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: HTTP ${res.status}`)
        const body: unknown = await res.json()
        if (!isTableData(body)) {
          throw new Error(
            'Unexpected response from /api/data (expected { columns, rows, warnings }). ' +
              'Is the server running the latest code?',
          )
        }
        setState({ status: 'ready', data: body })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return // cancelled on purpose, not an error
        const message = err instanceof Error ? err.message : String(err)
        setState({ status: 'error', message })
      })

    return () => controller.abort()
  }, [])

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '1.5rem' }}>
      <h1>Markdown Data Viewer</h1>
      {state.status === 'loading' && <p>Loading…</p>}
      {state.status === 'error' && (
        <p role="alert" style={{ color: '#b00020' }}>
          Could not load data. {state.message}
        </p>
      )}
      {state.status === 'ready' && (
        <>
          <Warnings warnings={state.data.warnings} />
          {state.data.columns.length === 0 ? (
            <p>No table found in data.md.</p>
          ) : (
            <DataTable columns={state.data.columns} rows={state.data.rows} />
          )}
        </>
      )}
    </main>
  )
}

export default App
