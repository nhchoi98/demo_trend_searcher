import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import baseConfig from "../finder.config.ts";
import type { Decision, DecisionBackend, DecisionSpec, TextBackend, TextSpec } from "../src/llm/backend.ts";
import { run, type Backends } from "../src/pipeline.ts";
import { buildCard } from "../src/sinks/teams.ts";
import { readJsonl } from "../src/store.ts";
import type { DecisionRecord, Paper, RelevanceValue, ReportItem, SeenRecord, Summary } from "../src/types.ts";

function paper(id: string, title: string): Paper {
  return {
    id,
    version: 1,
    title,
    abstract: `Abstract of ${title}.`,
    authors: ["Ada Example", "Bo Sample"],
    published: "2026-09-18T12:00:00Z",
    updated: "2026-09-18T12:00:00Z",
    categories: ["cs.CV"],
    url: `https://arxiv.org/abs/${id}`,
    pdfUrl: `https://arxiv.org/pdf/${id}`,
    matchedTopics: ["world-model"],
  };
}

/** Scripted decision backend: answers by keyword in the title. */
class FakeDecide implements DecisionBackend {
  readonly id = "fake";
  calls = 0;
  readonly model: string;
  readonly confidence: number;
  constructor(model: string, confidence: number) {
    this.model = model;
    this.confidence = confidence;
  }
  async decide<T>(_spec: DecisionSpec, state: string): Promise<Decision<T>> {
    this.calls++;
    if (state.includes("BOOM")) throw new Error("backend exploded");
    const value: RelevanceValue = state.includes("Noise")
      ? { label: "irrelevant", tags: [] }
      : { label: "core", tags: ["world-model"] };
    return { value: value as T, confidence: this.confidence, backend: this.id, model: this.model };
  }
}

class FakeText implements TextBackend {
  readonly id = "fake";
  readonly model = "fake-writer";
  calls = 0;
  async write<T>(_spec: TextSpec, _input: string): Promise<T> {
    this.calls++;
    const summary: Summary = {
      oneLiner: "One line.",
      problem: "Problem.",
      method: "Method.",
      results: "Results.",
      whyItMatters: "Why.",
    };
    return summary as T;
  }
}

const NOW = new Date("2026-09-21T02:17:00Z");

test("run: gates, summarizes, persists, and skips seen papers on the next run", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    const papers = [paper("2609.00001", "Good World Model"), paper("2609.00002", "Noise Paper"), paper("2609.00003", "BOOM Paper")];
    const text = new FakeText();
    const backends: Backends = { decide: new FakeDecide("small", 0.95), text };
    const options = { config: baseConfig, rootDir, dryRun: false, backends, now: NOW, fetchPapers: async () => papers };

    const first = await run(options);
    assert.equal(first.date, "2026-09-21"); // 02:17Z is 11:17 in Asia/Seoul
    assert.deepEqual(first.stats, { fetched: 3, fresh: 3, failed: 1 });
    assert.deepEqual(first.items.map((i) => i.paper.id), ["2609.00001"]);
    assert.equal(text.calls, 1, "irrelevant papers must not be summarized");

    const seen = await readJsonl<SeenRecord>(join(rootDir, "data", "papers.jsonl"));
    assert.deepEqual(seen.map((s) => [s.id, s.label, s.reported]), [
      ["2609.00001", "core", true],
      ["2609.00002", "irrelevant", false],
    ]);

    const report = await readFile(join(rootDir, "reports", "2026-09-21.md"), "utf8");
    assert.match(report, /### Good World Model \[1\]/);
    assert.match(report, /Problem\. Method\. Results\. Why\./);
    assert.match(report, /1\. Ada Example, Bo Sample\. "Good World Model\." arXiv:2609\.00001 \(2026-09-18\)\. https:\/\/arxiv\.org\/abs\/2609\.00001/);
    assert.doesNotMatch(report, /Noise Paper/);

    // Second run: only the paper that failed is retried.
    const second = await run(options);
    assert.deepEqual(second.stats, { fetched: 3, fresh: 1, failed: 1 });
    assert.equal(text.calls, 1);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("run: low confidence escalates and logs both decisions", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    const small = new FakeDecide("small", 0.4);
    const big = new FakeDecide("big", 0.9);
    const result = await run({
      config: baseConfig,
      rootDir,
      dryRun: false,
      backends: { decide: small, escalate: big, text: new FakeText() },
      now: NOW,
      fetchPapers: async () => [paper("2609.00009", "Unclear World Model")],
    });
    assert.equal(result.items[0]?.confidence, 0.9);
    const log = await readJsonl<DecisionRecord>(join(rootDir, "data", "decisions.jsonl"));
    assert.deepEqual(log.map((l) => [l.model, l.escalatedFrom]), [
      ["small", undefined],
      ["big", "fake:small"],
    ]);
    assert.equal(log[0]?.inputHash, log[1]?.inputHash);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("run --dry-run writes nothing and needs no backends", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    const result = await run({ config: baseConfig, rootDir, dryRun: true, now: NOW, fetchPapers: async () => [paper("2609.1", "X")] });
    assert.equal(result.stats.fresh, 1);
    assert.deepEqual(await readJsonl(join(rootDir, "data", "papers.jsonl")), []);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("buildCard stays under the Teams payload limit", () => {
  const long = "가".repeat(1500);
  const items: ReportItem[] = Array.from({ length: 30 }, (_, i) => ({
    paper: paper(`2609.${String(i).padStart(5, "0")}`, `Paper [${i}] with *markdown* chars`),
    relevance: { label: "core", tags: [] },
    confidence: 0.9,
    summary: { oneLiner: long, problem: "", method: "", results: "", whyItMatters: "" },
  }));
  const payload = buildCard("2026-09-21", items, { fetched: 30, fresh: 30, failed: 0 }, baseConfig, "https://example.com/r.md");
  const bytes = Buffer.byteLength(JSON.stringify(payload));
  assert.ok(bytes <= 24_000, `payload was ${bytes} bytes`);
  assert.match(JSON.stringify(payload), /Paper \\\\\[0\\\\\]/);
});
