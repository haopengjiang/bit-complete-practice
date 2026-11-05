/** One parsed table row: column name -> cell text. */
export type Row = Record<string, string>;

/** A recoverable problem found while parsing; `line` is 1-based in the source file. */
export type ParseWarning = { line: number; message: string };

/** Parser output: final column names (in order), row objects, and any warnings. */
export type ParseResult = { columns: string[]; rows: Row[]; warnings: ParseWarning[] };

/** A trimmed table line plus its 1-based line number in the file. */
type NumberedLine = { text: string; line: number };

/** Split a `| a | b \| c |` line into trimmed cells; `\|` is a literal pipe. */
function splitCells(line: string): string[] {
  let inner = line.trim();
  if (inner.startsWith("|")) inner = inner.slice(1);
  // Only an unescaped trailing pipe closes the row; `\|` at the end is content.
  if (inner.endsWith("|") && !inner.endsWith("\\|")) inner = inner.slice(0, -1);
  return inner.split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, "|").trim());
}

/** True for the `|---|:--:|` separator row under the header. */
function isSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-+:?$/.test(cell));
}

/** Return the first contiguous block of `|` lines (the first table), with line numbers. */
function firstTableBlock(markdown: string): NumberedLine[] {
  const lines = markdown.split(/\r?\n/).map((text, i) => ({ text: text.trim(), line: i + 1 }));
  const start = lines.findIndex((l) => l.text.startsWith("|"));
  if (start === -1) return [];

  const block: NumberedLine[] = [];
  for (const l of lines.slice(start)) {
    if (!l.text.startsWith("|")) break; // any non-table line ends the table
    block.push(l);
  }
  return block;
}

/** Make header names unique: a repeat of `name` becomes `name_2`, `name_3`, ... */
function dedupeHeaders(headers: string[], line: number, warnings: ParseWarning[]): string[] {
  // Reserve every original name up front so a rename never takes an existing header.
  const used = new Set(headers);
  const seen = new Set<string>();

  return headers.map((h) => {
    if (!seen.has(h)) {
      seen.add(h);
      return h;
    }
    let n = 1;
    let candidate: string;
    do candidate = `${h}_${++n}`;
    while (used.has(candidate));
    used.add(candidate);
    warnings.push({ line, message: `Duplicate header "${h}" renamed to "${candidate}"` });
    return candidate;
  });
}

/**
 * Parse the first markdown table into columns, row objects and warnings.
 * Requires a separator row right after the header, otherwise there are no rows.
 * Missing cells become ""; extra cells are dropped with a warning.
 */
export function parseMarkdownTable(markdown: string): ParseResult {
  const warnings: ParseWarning[] = [];
  const [header, separator, ...dataLines] = firstTableBlock(markdown);
  if (header === undefined || separator === undefined) return { columns: [], rows: [], warnings };
  if (!isSeparator(splitCells(separator.text))) return { columns: [], rows: [], warnings };

  const columns = dedupeHeaders(splitCells(header.text), header.line, warnings);

  const rows = dataLines.map(({ text, line }) => {
    const cells = splitCells(text);
    if (cells.length > columns.length) {
      const extra = cells.slice(columns.length).map((c) => JSON.stringify(c));
      warnings.push({
        line,
        message: `Row has ${cells.length} cells but the header has ${columns.length}; dropped extra: ${extra.join(", ")}`,
      });
    }
    return Object.fromEntries(columns.map((col, i) => [col, cells[i] ?? ""]));
  });

  return { columns, rows, warnings };
}
