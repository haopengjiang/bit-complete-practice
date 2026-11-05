import { useEffect, useState } from 'react'
import DataTable from './DataTable.tsx'
import type { Row } from './types.ts'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; rows: Row[] }

/** Fetches /api/data once and shows loading, error, empty, or the table. */
function App() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    // Abort on unmount (also covers StrictMode's double-run in dev).
    const controller = new AbortController()

    fetch('/api/data', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: HTTP ${res.status}`)
        const rows = (await res.json()) as Row[]
        setState({ status: 'ready', rows })
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
      {state.status === 'ready' &&
        (state.rows.length === 0 ? <p>No rows found in data.md.</p> : <DataTable rows={state.rows} />)}
    </main>
  )
}

export default App
