/** One parsed table row: header name -> cell text. */
export type Row = Record<string, string>;

/** Split a `| a | b |` line into trimmed cell strings. */
function splitCells(line: string): string[] {
  let inner = line.trim();
  if (inner.startsWith("|")) inner = inner.slice(1);
  if (inner.endsWith("|")) inner = inner.slice(0, -1);
  return inner.split("|").map((cell) => cell.trim());
}

/** True for the `|---|:--:|` separator row under the header. */
function isSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-+:?$/.test(cell));
}

/** Return the first contiguous block of `|` lines (the first table), trimmed. */
function firstTableBlock(markdown: string): string[] {
  const lines = markdown.split(/\r?\n/).map((line) => line.trim());
  const start = lines.findIndex((line) => line.startsWith("|"));
  if (start === -1) return [];

  const block: string[] = [];
  for (const line of lines.slice(start)) {
    if (!line.startsWith("|")) break; // any non-table line ends the table
    block.push(line);
  }
  return block;
}

/**
 * Parse the first markdown table into row objects keyed by the header cells.
 * Requires a separator row right after the header, otherwise returns [].
 * Text outside the table is ignored; missing cells become "" and extra cells are dropped.
 */
export function parseMarkdownTable(markdown: string): Row[] {
  const [headerLine, separatorLine, ...dataLines] = firstTableBlock(markdown);
  if (headerLine === undefined || separatorLine === undefined) return [];
  if (!isSeparator(splitCells(separatorLine))) return [];

  const headers = splitCells(headerLine);
  return dataLines
    .map(splitCells)
    .map((cells) => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""])));
}
