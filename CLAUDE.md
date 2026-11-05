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
  src/parseMarkdown.ts    # pure parser: parseMarkdownTable(text) => Row[]
  src/parseMarkdown.test.ts
client/
  vite.config.ts          # dev proxy: /api -> http://localhost:3001
  src/App.tsx             # fetch + loading / error / empty / table states
  src/DataTable.tsx       # generic table, columns from the first row's keys
  src/types.ts            # Row = Record<string, string>
```

## Running

Install once: `npm --prefix server install` and `npm --prefix client install`.

```sh
npm run dev:server     # terminal 1: Express on http://localhost:3001
npm run dev:client     # terminal 2: Vite on http://localhost:5173
npm test               # parser unit tests (node:test via tsx)
```

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
- Cells are trimmed. Missing cells become `""` and extra cells are dropped.
- Text outside the table is ignored, but it must go before or after the table, not between rows.

## Conventions

- The server uses ESM with `NodeNext`, so relative imports use the `.js` extension (`./parseMarkdown.js`). The client uses bundler resolution with `.ts`/`.tsx` extensions and `import type` (`verbatimModuleSyntax`).
- Keep the parser pure and test-first: add a failing test in `parseMarkdown.test.ts` before changing `parseMarkdown.ts`.
- The client calls the relative path `/api/data`. In dev, Vite's proxy forwards it to the server.
