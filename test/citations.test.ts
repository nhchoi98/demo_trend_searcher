import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkCitations } from "../src/citations.ts";
import { authorSignals, lookup, type S2Paper } from "../src/sources/semanticscholar.ts";
import { readJsonl } from "../src/store.ts";
import type { CitationRecord } from "../src/types.ts";

function fakeFetch(rows: Array<S2Paper | null>, seen: string[]): typeof fetch {
  return (async (_url: unknown, init?: RequestInit) => {
    seen.push(String(init?.body));
    return new Response(JSON.stringify(rows), { status: 200 });
  }) as typeof fetch;
}

test("lookup maps arXiv ids to rows and skips papers Semantic Scholar does not know", async () => {
  const bodies: string[] = [];
  const rows = await lookup(["2609.1", "2609.2"], "authors.hIndex", {
    fetchImpl: fakeFetch([{ authors: [{ hIndex: 3 }, { hIndex: 22 }] }, null], bodies),
  });
  assert.deepEqual([...rows.keys()], ["2609.1"]);
  assert.equal(bodies[0], JSON.stringify({ ids: ["ARXIV:2609.1", "ARXIV:2609.2"] }));
  const h = await authorSignals(["2609.1"], { fetchImpl: fakeFetch([{ authors: [{ hIndex: 3, affiliations: ["NVIDIA"] }, { hIndex: null, affiliations: ["NVIDIA", "MIT"] }] }], []) });
  assert.deepEqual(h.get("2609.1"), { hIndex: 3, affiliations: ["NVIDIA", "MIT"] });
});

test("checkCitations records each reported paper once, only after --after-days", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    await mkdir(join(rootDir, "data"));
    const seen = [
      { id: "old", reported: true, runDate: "2026-08-01" },
      { id: "fresh", reported: true, runDate: "2026-09-20" },
      { id: "rejected", reported: false, runDate: "2026-08-01" },
    ];
    await writeFile(join(rootDir, "data", "papers.jsonl"), seen.map((s) => JSON.stringify(s)).join("\n") + "\n");
    const asked: string[][] = [];
    const lookupImpl: typeof lookup = async (ids) => {
      asked.push([...ids]);
      return new Map([["old", { citationCount: 7, influentialCitationCount: 1 }]]);
    };
    const now = new Date("2026-09-21T00:00:00Z");
    const options = { rootDir, afterDays: 30, now, lookupImpl };
    assert.equal(await checkCitations(options), 1);
    assert.deepEqual(asked, [["old"]], "only the reported paper past the window is looked up");
    const records = await readJsonl<CitationRecord>(join(rootDir, "data", "citations.jsonl"));
    assert.deepEqual(
      records.map((r) => [r.id, r.daysAfter, r.citationCount, r.influentialCitationCount]),
      [["old", 51, 7, 1]],
    );
    assert.equal(await checkCitations(options), 0, "already recorded: nothing due");
    assert.equal(asked.length, 1);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
