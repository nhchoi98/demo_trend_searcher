import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import base from "../finder.config.ts";
import type { AnswersFor, AskResult, DecisionBackend, Questions, State, TextBackend, TextSpec } from "../src/llm/backend.ts";
import { run, type Backends } from "../src/pipeline.ts";
import { buildCard } from "../src/sinks/teams.ts";
import { readJsonl } from "../src/store.ts";
import type { DecisionRecord, Paper, ReportItem, SeenRecord, Summary } from "../src/types.ts";

// Fake backends answer with fixed scores; the priority floor and the author term are
// tested in triage.test.ts. author: 0 also keeps the pipeline off the network.
const baseConfig = {
  ...base,
  gate: { ...base.gate, minPriority: 0, priorityWeights: { ...base.gate.priorityWeights, author: 0 } },
};

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

/** Scripted decision backend: answers every question, steered by keywords in the title. */
class FakeDecide implements DecisionBackend {
  readonly id = "fake";
  calls = 0;
  readonly model: string;
  readonly confidence: number;
  constructor(model: string, confidence: number) {
    this.model = model;
    this.confidence = confidence;
  }
  async ask<const Q extends Questions>(state: State, questions: Q): Promise<AskResult<Q>> {
    this.calls++;
    const text = JSON.stringify(state);
    if (text.includes("BOOM")) throw new Error("backend exploded");
    const noise = text.includes("Noise");
    const modest = text.includes("Modest"); // significance 1.5/3 -> priority 0.8 with core
    const answers: Record<string, unknown> = {};
    for (const [name, q] of Object.entries(questions)) {
      if (q.type === "noul") {
        answers[name] = { type: "noul", probability: name === "tag:world-model" && !noise ? 0.9 : 0.1 };
      } else if (q.type === "score") {
        answers[name] = { type: "score", score: modest ? 1.5 : 3, confidence: this.confidence };
      } else {
        const choice = name === "label" ? (noise ? "irrelevant" : "core") : name === "topic" ? (text.includes("Untopical") ? "none" : "physical-ai") : "method";
        answers[name] = { type: "choice", choice, confidence: this.confidence };
      }
    }
    return { answers: answers as AnswersFor<Q>, backend: this.id, model: this.model, inputTokens: 100, outputTokens: 0 };
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

/** Keeps the pipeline off arxiv.org / GitHub / Hugging Face. Titles steer the fake page. */
const offline = {
  fetchHtml: async (p: Paper) => ({
    affiliations: p.title.includes("NVIDIA") ? ["NVIDIA Research", "Stanford University"] : p.title.includes("Modest") ? ["MIT"] : [],
    links: ["https://github.com/example/repo"],
    ...(p.title.includes("Modest") ? {} : { imageUrl: "https://arxiv.org/html/x/fig1.png" }),
  }),
  fetchArtifacts: async () => ({ code: { url: "https://github.com/example/repo", license: "MIT" }, imageUrl: "https://raw.githubusercontent.com/example/repo/HEAD/teaser.png" }),
};

test("run: gates, summarizes, persists, and skips seen papers on the next run", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    const papers = [paper("2609.00001", "Good World Model"), paper("2609.00002", "Noise Paper"), paper("2609.00003", "BOOM Paper")];
    const text = new FakeText();
    const backends: Backends = { decide: new FakeDecide("small", 0.95), text };
    const options = { ...offline, config: baseConfig, rootDir, dryRun: false, backends, now: NOW, fetchPapers: async () => papers };

    const first = await run(options);
    assert.equal(first.date, "2026-09-21"); // 02:17Z is 11:17 in Asia/Seoul
    assert.deepEqual(first.stats, { fetched: 3, fresh: 3, failed: 1, deferred: 0, keywordMissed: 0 });
    assert.deepEqual(first.items.map((i) => i.paper.id), ["2609.00001"]);
    assert.equal(text.calls, 1, "irrelevant papers must not be summarized");

    const seen = await readJsonl<SeenRecord>(join(rootDir, "data", "papers.jsonl"));
    // Rejected papers are written first (immediately, slim); reported ones at the end (full).
    assert.deepEqual(seen.map((s) => [s.id, s.label, s.reported, s.title]), [
      ["2609.00002", "irrelevant", false, undefined],
      ["2609.00001", "core", true, "Good World Model"],
    ]);
    assert.equal(seen[1]?.topic, "physical-ai");
    assert.deepEqual(seen[1]?.tags, ["world-model"], "only tags at or above gate.tagThreshold are kept");
    assert.equal(seen[1]?.priority, 1, "core (1.0) and top significance (3/3) give priority 1");

    const report = await readFile(join(rootDir, "reports", "2026-09-21.md"), "utf8");
    assert.match(report, /### Good World Model \[1\]/);
    // The gate's topic wins over the keyword-matched topic when choosing the section.
    assert.match(report, /### Good World Model \[1\]\n\npriority 1\.00 · Physical AI \/ Embodied AI · core/);
    assert.match(report, /Problem\. Method\. Results\. Why\./);
    assert.match(report, /\n코드: \[MIT\]\(https:\/\/github\.com\/example\/repo\) · 가중치: 없음\n\n!\[대표 이미지\]\(https:\/\/arxiv\.org\/html\/x\/fig1\.png\)\n/, "figure 1 beats the README image");
    assert.deepEqual(seen[1]?.artifacts, { code: { url: "https://github.com/example/repo", license: "MIT" }, imageUrl: "https://arxiv.org/html/x/fig1.png" });
    assert.match(report, /1\. Ada Example, Bo Sample\. "Good World Model\." arXiv:2609\.00001 \(2026-09-18\)\. https:\/\/arxiv\.org\/abs\/2609\.00001/);
    assert.doesNotMatch(report, /Noise Paper/);

    // Second run: only the paper that failed is retried.
    const second = await run(options);
    assert.deepEqual(second.stats, { fetched: 3, fresh: 1, failed: 1, deferred: 0, keywordMissed: 0 });
    assert.equal(text.calls, 1);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("run: by default an unsure judgment is NOT re-judged; the paper is reported as borderline", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    const big = new FakeDecide("big", 0.9);
    const result = await run({
      ...offline,
      config: baseConfig,
      rootDir,
      dryRun: false,
      backends: { decide: new FakeDecide("small", 0.4), escalate: big, text: new FakeText() },
      now: NOW,
      fetchPapers: async () => [paper("2609.00008", "Unclear World Model")],
    });
    assert.equal(big.calls, 0, "gate.escalate is off by default");
    assert.equal(result.items[0]?.triage.borderline, true);
    assert.match(await readFile(join(rootDir, "reports", "2026-09-21.md"), "utf8"), /core \(0\.40\) · 경계\(직접 판단 필요\)/);
    const seen = await readJsonl<SeenRecord>(join(rootDir, "data", "papers.jsonl"));
    assert.equal(seen[0]?.borderline, true);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("run: with gate.escalate on, low confidence escalates and logs both decisions", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    const small = new FakeDecide("small", 0.4);
    const big = new FakeDecide("big", 0.9);
    const result = await run({
      ...offline,
      config: { ...baseConfig, gate: { ...baseConfig.gate, escalate: true } },
      rootDir,
      dryRun: false,
      backends: { decide: small, escalate: big, text: new FakeText() },
      now: NOW,
      fetchPapers: async () => [paper("2609.00009", "Unclear World Model")],
    });
    assert.equal(result.items[0]?.triage.labelConfidence, 0.9);
    const log = await readJsonl<DecisionRecord>(join(rootDir, "data", "decisions.jsonl"));
    assert.deepEqual(log.map((l) => [l.model, l.escalatedFrom]), [
      ["small", undefined],
      ["big", "fake:small"],
    ]);
    assert.equal(log[0]?.inputHash, log[1]?.inputHash);
    assert.deepEqual(log[0]?.answers.label, ["core", 0.4]);
    assert.deepEqual(log[0]?.answers["tag:world-model"], [true, 0.9]);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("run: maxNewPerRun defers the oldest papers and keyword misses are counted", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    const older = { ...paper("2609.00010", "Older Paper"), published: "2026-09-17T00:00:00Z" };
    const newer = { ...paper("2609.00011", "Newer Paper Without Any Topic Phrase"), matchedTopics: [] };
    const config = { ...baseConfig, gate: { ...baseConfig.gate, maxNewPerRun: 1 } };
    const options = {
      ...offline,
      config,
      rootDir,
      dryRun: false,
      backends: { decide: new FakeDecide("small", 0.95), text: new FakeText() },
      now: NOW,
      fetchPapers: async () => [older, newer],
    };

    const first = await run(options);
    assert.deepEqual(first.items.map((i) => i.paper.id), ["2609.00011"], "newest first");
    assert.deepEqual(first.stats, { fetched: 2, fresh: 2, failed: 0, deferred: 1, keywordMissed: 1 });
    assert.match(await readFile(join(rootDir, "reports", "2026-09-21.md"), "utf8"), /키워드 미매칭/);

    const second = await run(options);
    assert.deepEqual(second.items.map((i) => i.paper.id), ["2609.00010"], "deferred paper is picked up next run");
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("run: a matching affiliation adds the bonus, but only on-topic papers and never past the gate", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    const fetched: string[] = [];
    const config = { ...baseConfig, gate: { ...baseConfig.gate, minPriority: 0.82, affiliations: ["nvidia"], affiliationBoost: 0.05 } };
    const result = await run({
      ...offline,
      fetchHtml: async (p) => (fetched.push(p.id), offline.fetchHtml(p)),
      config,
      rootDir,
      dryRun: false,
      backends: { decide: new FakeDecide("small", 0.95), text: new FakeText() },
      now: NOW,
      fetchPapers: async () => [
        paper("2609.00021", "Modest NVIDIA Paper"),
        paper("2609.00022", "Modest Other Paper"),
        paper("2609.00023", "Modest NVIDIA Untopical Paper"),
        paper("2609.00024", "Noise Paper"),
      ],
    });
    assert.deepEqual(result.items.map((i) => i.paper.id), ["2609.00021"], "0.8 + 0.05 passes 0.82; no match or topic none stays at 0.8");
    assert.deepEqual(fetched.sort(), ["2609.00021", "2609.00022", "2609.00023"], "irrelevant papers are never fetched");
    assert.deepEqual(result.items[0]?.triage.affiliations, ["nvidia"]);
    assert.equal(result.items[0]?.triage.priority, 0.85);
    const report = await readFile(join(rootDir, "reports", "2026-09-21.md"), "utf8");
    assert.match(report, /priority 0\.85 · .* · 소속: NVIDIA Research, Stanford University · /);
    assert.match(report, /!\[대표 이미지\]\(https:\/\/raw\.githubusercontent\.com\/example\/repo\/HEAD\/teaser\.png\)/, "README image when the page has no figure");
    const seen = await readJsonl<SeenRecord>(join(rootDir, "data", "papers.jsonl"));
    assert.deepEqual(seen.find((s) => s.id === "2609.00021")?.affiliations, ["nvidia"]);
    assert.equal(seen.find((s) => s.id === "2609.00022")?.affiliations, undefined);
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
    triage: {
      label: "core",
      labelConfidence: 0.9,
      includeProbability: 1,
      included: true,
      borderline: false,
      topic: "none",
      tags: [],
      contribution: "method",
      significance: 2,
      priority: 0.8,
    },
    summary: { oneLiner: long, problem: "", method: "", results: "", whyItMatters: "" },
    affiliations: [],
    artifacts: { imageUrl: "https://arxiv.org/html/x/fig1.png" },
  }));
  const payload = buildCard("2026-09-21", items, { fetched: 30, fresh: 30, failed: 0, deferred: 0 }, baseConfig, "https://example.com/r.md");
  const bytes = Buffer.byteLength(JSON.stringify(payload));
  assert.ok(bytes <= 24_000, `payload was ${bytes} bytes`);
  assert.match(JSON.stringify(payload), /Paper \\\\\[0\\\\\]/);
});
