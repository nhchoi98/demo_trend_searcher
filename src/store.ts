import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { DecisionRecord, SeenRecord } from "./types.ts";

/**
 * State is plain append-only JSONL committed to the repo: no database to run,
 * diffs stay human-readable, and DuckDB / SQLite / pandas can read it directly
 * when it is time to analyse trends or compare backends.
 */
export class Store {
  readonly papersPath: string;
  readonly decisionsPath: string;

  constructor(dataDir: string) {
    this.papersPath = join(dataDir, "papers.jsonl");
    this.decisionsPath = join(dataDir, "decisions.jsonl");
  }

  async loadSeenIds(): Promise<Set<string>> {
    const records = await readJsonl<SeenRecord>(this.papersPath);
    return new Set(records.map((r) => r.id));
  }

  async appendSeen(records: readonly SeenRecord[]): Promise<void> {
    await appendJsonl(this.papersPath, records);
  }

  async appendDecisions(records: readonly DecisionRecord[]): Promise<void> {
    await appendJsonl(this.decisionsPath, records);
  }
}

export async function readJsonl<T>(path: string): Promise<T[]> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const out: T[] = [];
  for (const [index, line] of text.split("\n").entries()) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line) as T);
    } catch {
      // A half-written last line (killed run) must not brick every later run.
      console.warn(`[store] skipping malformed line ${index + 1} in ${path}`);
    }
  }
  return out;
}

async function appendJsonl(path: string, records: readonly unknown[]): Promise<void> {
  if (records.length === 0) return;
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, records.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
}
