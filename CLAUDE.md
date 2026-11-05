# CLAUDE.md

This file gives Claude Code guidance for working in this repository.

## Project overview

A small full-stack app that shows the table in `server/data.md` as an HTML table.

- **server/**: Node + Express + TypeScript. `GET /api/data` reads `data.md` on every request, parses it, and returns JSON.
- **client/**: Vite + React + TypeScript (scaffolded with `npm create vite`, `react-ts` template). Fetches `/api/data` and renders it.

Dependencies are kept minimal on purpose: no markdown library, no CORS package, no `concurrently`, no UI or table library.

## Structure

```
package.json              # root: scripts only, no dependencies
server/
  data.md                 # the data source (see format below)
  src/index.ts            # Express app, GET /api/data, port 3001 (PORT env overrides)
  src/parseMarkdown.ts    # pure parser: parseMarkdownTable(text) => { columns, rows, warnings }
  tsconfig.build.json     # build config that leaves *.test.ts out of dist/
  src/parseMarkdown.test.ts
client/
  vite.config.ts          # dev proxy: /api -> http://localhost:3001
  src/App.tsx             # fetch + loading / error / no-table states, warnings panel, table
  src/DataTable.tsx       # generic sortable table: headers from `columns` (shown even with 0 rows)
  src/sortRows.ts         # pure sort helpers: isNumericCell, compareCells, sortRows
  src/sortRows.test.ts
  src/types.ts            # Row, ParseWarning, TableData (mirror the server types)
```

## Running

Install once: `npm --prefix server install` and `npm --prefix client install`.

```sh
npm run dev:server     # terminal 1: Express on http://localhost:3001
npm run dev:client     # terminal 2: Vite on http://localhost:5173
npm test               # server parser tests + client sort tests
npm --prefix server test   # node:test via tsx
npm --prefix client test   # node:test via Node's --experimental-strip-types (no extra deps)
```

Client `*.test.ts` files are excluded in `tsconfig.app.json`, because the app config only loads `vite/client` types.

Type checks and builds:

```sh
cd server && npx tsc --noEmit     # not `npm --prefix server exec tsc -- ...`, which drops the flags
npm --prefix server run build     # -> server/dist
npm --prefix client run build     # tsc -b && vite build
npm --prefix client run lint      # oxlint
```

## `data.md` format

A markdown table. The header row gives the object keys, and each data row becomes one object. All values are strings.

```md
| id | name  | role     |
|----|-------|----------|
| 1  | Alice | Engineer |
```

Parsing rules (covered by `parseMarkdown.test.ts`):
- Only the **first table** is parsed: the first unbroken run of lines starting with `|`. Any non-table line, including a blank line, ends it.
- Line 2 of the table **must be a separator** (`|---|`, alignment colons allowed), or the result is `[]`.
- Every line after the separator is a data row, even one whose cells are all `-`.
- Cells are trimmed, and `\|` inside a cell is a literal pipe, not a column break.
- Missing cells become `""`. Extra cells are dropped **with a warning**.
- Duplicate headers are renamed `name_2`, `name_3`, … **with a warning**. A rename never reuses an existing header name.
- Text outside the table is ignored, but it must go before or after the table, not between rows.

`parseMarkdownTable` and `GET /api/data` both return `{ columns, rows, warnings }`. Each warning is `{ line, message }`, with `line` 1-based in `data.md`. The server also logs warnings to its console as `data.md:<line>: <message>`.

## Table sorting

Clicking a header cycles ascending ▲, descending ▼, then the original order. `DataTable` keeps `{ column, direction }` in state and derives `visibleRows` with `useMemo`; rows are never copied into state.

Sorting rules (covered by `sortRows.test.ts`):
- A cell is a number only if its trimmed text is a plain decimal (`-3`, `2.5`, `.5`). Values like `1,200`, `12px`, `0x10` and `1e3` are text.
- Numbers compare by value and come before text. Text compares case-insensitively with natural digit order (`item2` before `item10`).
- Empty or whitespace-only cells always go last, in both directions.
- The sort is stable and never mutates the input.

## Conventions

- The server uses ESM with `NodeNext`, so relative imports use the `.js` extension (`./parseMarkdown.js`). The client uses bundler resolution with `.ts`/`.tsx` extensions and `import type` (`verbatimModuleSyntax`).
- Keep the parser pure and test-first: add a failing test in `parseMarkdown.test.ts` before changing `parseMarkdown.ts`.
- The client calls the relative path `/api/data`. In dev, Vite's proxy forwards it to the server.
