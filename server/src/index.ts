import express from "express";
import { readFile } from "node:fs/promises";
import { parseMarkdownTable } from "./parseMarkdown.js";

const PORT = Number(process.env.PORT) || 3001;
// Resolves to server/data.md from both src/ (tsx) and dist/ (compiled).
const DATA_FILE = new URL("../data.md", import.meta.url);

const app = express();

/** GET /api/data: data.md parsed into row objects, re-read on every request. */
app.get("/api/data", async (_req, res) => {
  try {
    const markdown = await readFile(DATA_FILE, "utf8");
    res.json(parseMarkdownTable(markdown));
  } catch (err) {
    console.error("Failed to read data.md:", err);
    res.status(500).json({ error: "Could not read data file" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
