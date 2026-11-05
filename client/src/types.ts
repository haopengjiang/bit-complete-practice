/** One row from GET /api/data: column name -> cell text (mirrors server Row). */
export type Row = Record<string, string>

/** A recoverable parse problem; `line` is 1-based in data.md (mirrors server ParseWarning). */
export type ParseWarning = { line: number; message: string }

/** Response body of GET /api/data (mirrors server ParseResult). */
export type TableData = { columns: string[]; rows: Row[]; warnings: ParseWarning[] }
