import { join } from "node:path";
import { lookup } from "./sources/semanticscholar.ts";
import { readJsonl, Store } from "./store.ts";
import type { CitationRecord, SeenRecord } from "./types.ts";

export interface CitationOptions {
  rootDir: string;
  /** A reported paper is looked up once, this many days after the run that reported it. */
  afterDays: number;
  apiKey?: string;
  now?: Date;
  /** Injectable for tests. */
  lookupImpl?: typeof lookup;
}

const DAY_MS = 86_400_000;

/**
 * Check-back: how often were the papers we reported cited, `afterDays` later?
 * Appends one line per paper to data/citations.jsonl so the judgment log can be
 * scored against what actually happened. Never touches the daily report.
 */
export async function checkCitations(options: CitationOptions): Promise<number> {
  const now = options.now ?? new Date();
  const store = new Store(join(options.rootDir, "data"));
  const seen = await readJsonl<SeenRecord>(store.papersPath);
  const checked = new Set((await readJsonl<CitationRecord>(store.citationsPath)).map((c) => c.id));
  const daysSince = (runDate: string): number => Math.floor((now.getTime() - Date.parse(runDate)) / DAY_MS);
  const due = seen.filter((r) => r.reported && !checked.has(r.id) && daysSince(r.runDate) >= options.afterDays);
  if (due.length === 0) {
    console.log("[citations] nothing due");
    return 0;
  }
  const rows = await (options.lookupImpl ?? lookup)(
    due.map((r) => r.id),
    "citationCount,influentialCitationCount",
    options.apiKey ? { apiKey: options.apiKey } : {},
  );
  const records: CitationRecord[] = [];
  for (const r of due) {
    const row = rows.get(r.id);
    if (!row) continue; // not indexed yet: tried again on the next run
    records.push({
      id: r.id,
      runDate: r.runDate,
      checkedAt: now.toISOString(),
      daysAfter: daysSince(r.runDate),
      citationCount: row.citationCount ?? 0,
      influentialCitationCount: row.influentialCitationCount ?? 0,
    });
  }
  await store.appendCitations(records);
  console.log(`[citations] ${due.length} due, ${records.length} recorded, ${due.length - records.length} not indexed yet`);
  return records.length;
}
