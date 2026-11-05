import express from "express";
import { readFile } from "node:fs/promises";
import { parseMarkdownTable } from "./parseMarkdown.js";

const PORT = Number(process.env.PORT) || 3001;
// Resolves to server/data.md from both src/ (tsx) and dist/ (compiled).
const DATA_FILE = new URL("../data.md", import.meta.url);

const app = express();

/** GET /api/data: data.md parsed into { columns, rows, warnings }, re-read on every request. */
app.get("/api/data", async (_req, res) => {
  let markdown: string;
  try {
    markdown = await readFile(DATA_FILE, "utf8");
  } catch (err) {
    console.error("Failed to read data.md:", err);
    res.status(500).json({ error: "Could not read data file" });
    return;
  }

  const result = parseMarkdownTable(markdown);
  for (const w of result.warnings) console.warn(`data.md:${w.line}: ${w.message}`);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
