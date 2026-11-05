import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownTable } from "./parseMarkdown.js";

/** Rows only, for tests that don't care about columns/warnings. */
const rowsOf = (md: string) => parseMarkdownTable(md).rows;

test("parses a normal table into columns and rows, with no warnings", () => {
  const md = [
    "| id | name  | role     |",
    "|----|-------|----------|",
    "| 1  | Alice | Engineer |",
    "| 2  | Bob   | Designer |",
  ].join("\n");

  assert.deepEqual(parseMarkdownTable(md), {
    columns: ["id", "name", "role"],
    rows: [
      { id: "1", name: "Alice", role: "Engineer" },
      { id: "2", name: "Bob", role: "Designer" },
    ],
    warnings: [],
  });
});

test("skips the separator row, including alignment colons", () => {
  const md = ["| a | b | c |", "|:--|:-:|--:|", "| 1 | 2 | 3 |"].join("\n");
  assert.deepEqual(rowsOf(md), [{ a: "1", b: "2", c: "3" }]);
});

test("ignores blank lines and text outside the table", () => {
  const md = [
    "# Team",
    "",
    "Some intro text.",
    "| id | name |",
    "|----|------|",
    "| 1  | Alice |",
    "| 2  | Bob |",
    "",
    "A closing note after the table.",
  ].join("\n");

  assert.deepEqual(rowsOf(md), [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ]);
});

test("parses only the first table when the file has two", () => {
  const md = [
    "| id | name |",
    "|----|------|",
    "| 1  | Alice |",
    "",
    "Second table:",
    "",
    "| sku | price |",
    "|-----|-------|",
    "| X1  | 9.99  |",
  ].join("\n");

  assert.deepEqual(rowsOf(md), [{ id: "1", name: "Alice" }]);
});

test("keeps a data row where every cell is '-'", () => {
  const md = ["| id | name |", "|---|---|", "| 1 | Alice |", "| - | - |"].join("\n");
  assert.deepEqual(rowsOf(md), [
    { id: "1", name: "Alice" },
    { id: "-", name: "-" },
  ]);
});

test("returns no rows when the second line is not a separator row", () => {
  const md = ["| id | name |", "| 1  | Alice |", "| 2  | Bob |"].join("\n");
  assert.deepEqual(rowsOf(md), []);
});

test("trims extra whitespace around values and lines", () => {
  const md = ["   |  id  |   name   |", "|---|---|", "  |   7   |   Carol    |  "].join("\n");
  assert.deepEqual(rowsOf(md), [{ id: "7", name: "Carol" }]);
});

test("keeps an empty cell as an empty string", () => {
  const md = ["| id | name | role |", "|---|---|---|", "| 3 |  | Manager |"].join("\n");
  assert.deepEqual(rowsOf(md), [{ id: "3", name: "", role: "Manager" }]);
});

test("fills missing trailing cells with empty strings", () => {
  const md = ["| id | name | role |", "|---|---|---|", "| 4 | Dave |"].join("\n");
  assert.deepEqual(rowsOf(md), [{ id: "4", name: "Dave", role: "" }]);
});

test("handles Windows CRLF line endings", () => {
  const md = "| id | name |\r\n|---|---|\r\n| 6 | Frank |\r\n";
  assert.deepEqual(rowsOf(md), [{ id: "6", name: "Frank" }]);
});

test("returns empty columns, rows and warnings for an empty file", () => {
  assert.deepEqual(parseMarkdownTable(""), { columns: [], rows: [], warnings: [] });
});

test("returns no rows for a file with no table", () => {
  assert.deepEqual(rowsOf("# Title\n\nJust text."), []);
});

test("returns columns but no rows for a header-only table", () => {
  const result = parseMarkdownTable("| id | name |\n|---|---|");
  assert.deepEqual(result.columns, ["id", "name"]);
  assert.deepEqual(result.rows, []);
});

// --- Escaped pipes -----------------------------------------------------------

test("treats \\| inside a cell as a literal pipe, not a column break", () => {
  const md = ["| expr | note |", "|---|---|", "| a \\| b | x |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md), {
    columns: ["expr", "note"],
    rows: [{ expr: "a | b", note: "x" }],
    warnings: [],
  });
});

test("supports \\| in header cells", () => {
  const md = ["| a \\| b | c |", "|---|---|", "| 1 | 2 |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md).columns, ["a | b", "c"]);
});

test("a trailing \\| is cell content, not the closing pipe", () => {
  const md = ["| id | sym |", "|---|---|", "| 1 | or \\|"].join("\n");
  assert.deepEqual(rowsOf(md), [{ id: "1", sym: "or |" }]);
});

// --- Extra cells -------------------------------------------------------------

test("drops extra cells beyond the header and warns with the line number", () => {
  const md = ["| id | name |", "|---|---|", "| 5 | Eve | extra |"].join("\n");
  const result = parseMarkdownTable(md);

  assert.deepEqual(result.rows, [{ id: "5", name: "Eve" }]);
  assert.deepEqual(result.warnings, [
    { line: 3, message: 'Row has 3 cells but the header has 2; dropped extra: "extra"' },
  ]);
});

test("line numbers count from the top of the file, including text before the table", () => {
  const md = ["# Title", "", "| id |", "|---|", "| 1 |", "| 2 | x | y |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md).warnings, [
    { line: 6, message: 'Row has 3 cells but the header has 1; dropped extra: "x", "y"' },
  ]);
});

// --- Duplicate headers -------------------------------------------------------

test("renames duplicate headers with a numeric suffix and warns", () => {
  const md = ["| name | name | name |", "|---|---|---|", "| A | B | C |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md), {
    columns: ["name", "name_2", "name_3"],
    rows: [{ name: "A", name_2: "B", name_3: "C" }],
    warnings: [
      { line: 1, message: 'Duplicate header "name" renamed to "name_2"' },
      { line: 1, message: 'Duplicate header "name" renamed to "name_3"' },
    ],
  });
});

test("a renamed duplicate never collides with an existing header", () => {
  const md = ["| a | a_2 | a |", "|---|---|---|", "| 1 | 2 | 3 |"].join("\n");
  const result = parseMarkdownTable(md);

  assert.deepEqual(result.columns, ["a", "a_2", "a_3"]);
  assert.deepEqual(result.rows, [{ a: "1", a_2: "2", a_3: "3" }]);
});
