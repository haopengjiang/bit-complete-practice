import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarkdownTable } from "./parseMarkdown.js";

test("parses a normal table into objects keyed by header", () => {
  const md = [
    "| id | name  | role     |",
    "|----|-------|----------|",
    "| 1  | Alice | Engineer |",
    "| 2  | Bob   | Designer |",
  ].join("\n");

  assert.deepEqual(parseMarkdownTable(md), [
    { id: "1", name: "Alice", role: "Engineer" },
    { id: "2", name: "Bob", role: "Designer" },
  ]);
});

test("skips the separator row, including alignment colons", () => {
  const md = ["| a | b | c |", "|:--|:-:|--:|", "| 1 | 2 | 3 |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md), [{ a: "1", b: "2", c: "3" }]);
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

  assert.deepEqual(parseMarkdownTable(md), [
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

  assert.deepEqual(parseMarkdownTable(md), [{ id: "1", name: "Alice" }]);
});

test("keeps a data row where every cell is '-'", () => {
  const md = ["| id | name |", "|---|---|", "| 1 | Alice |", "| - | - |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md), [
    { id: "1", name: "Alice" },
    { id: "-", name: "-" },
  ]);
});

test("returns [] when the second line is not a separator row", () => {
  const md = ["| id | name |", "| 1  | Alice |", "| 2  | Bob |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md), []);
});

test("trims extra whitespace around values and lines", () => {
  const md = ["   |  id  |   name   |", "|---|---|", "  |   7   |   Carol    |  "].join("\n");
  assert.deepEqual(parseMarkdownTable(md), [{ id: "7", name: "Carol" }]);
});

test("keeps an empty cell as an empty string", () => {
  const md = ["| id | name | role |", "|---|---|---|", "| 3 |  | Manager |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md), [{ id: "3", name: "", role: "Manager" }]);
});

test("fills missing trailing cells with empty strings", () => {
  const md = ["| id | name | role |", "|---|---|---|", "| 4 | Dave |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md), [{ id: "4", name: "Dave", role: "" }]);
});

test("drops extra cells beyond the header", () => {
  const md = ["| id | name |", "|---|---|", "| 5 | Eve | extra |"].join("\n");
  assert.deepEqual(parseMarkdownTable(md), [{ id: "5", name: "Eve" }]);
});

test("handles Windows CRLF line endings", () => {
  const md = "| id | name |\r\n|---|---|\r\n| 6 | Frank |\r\n";
  assert.deepEqual(parseMarkdownTable(md), [{ id: "6", name: "Frank" }]);
});

test("returns [] for an empty file", () => {
  assert.deepEqual(parseMarkdownTable(""), []);
});

test("returns [] for a file with no table", () => {
  assert.deepEqual(parseMarkdownTable("# Title\n\nJust text."), []);
});

test("returns [] for a header-only table", () => {
  assert.deepEqual(parseMarkdownTable("| id | name |\n|---|---|"), []);
});
