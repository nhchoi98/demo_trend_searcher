import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import baseConfig from "../finder.config.ts";
import { compare, costUsd } from "../src/compare.ts";
import type { AskResult, DecisionBackend, Questions } from "../src/llm/backend.ts";
import { readJsonl } from "../src/store.ts";
import type { DecisionRecord, Paper } from "../src/types.ts";

const paper = (id: string): Paper => ({
  id, version: 1, title: `Paper ${id}`, abstract: "x", authors: [], published: "2026-09-21T00:00:00Z", updated: "", categories: ["cs.AI"], url: "", pdfUrl: "", matchedTopics: [],
});

/** Answers `label` per paper id from `labels`, everything else with a fixed value. */
function fake(model: string, labels: Record<string, string>): DecisionBackend & { asked: string[] } {
  return {
    id: "openai", model, asked: [],
    async ask<const Q extends Questions>(state: unknown, questions: Q): Promise<AskResult<Q>> {
      const id = (state as { title: string }).title.replace("Paper ", "");
      this.asked.push(id);
      const answers: Record<string, unknown> = {};
      for (const [name, q] of Object.entries(questions)) {
        answers[name] = q.type === "choice" ? { type: "choice", choice: name === "label" ? labels[id] : Object.keys(q.options)[0], confidence: 0.9 }
          : q.type === "noul" ? { type: "noul", probability: 0.1 } : { type: "score", score: 1, confidence: 0.9 };
      }
      return { answers: answers as AskResult<Q>["answers"], backend: "openai", model, inputTokens: 1000, outputTokens: 100 };
    },
  };
}

const record = (id: string, backend: string, model: string, label: string): DecisionRecord => ({
  ts: "", loop: "triage", subjectId: id, backend, model, inputHash: "h", inputTokens: 500, outputTokens: 0, latencyMs: 20,
  answers: { label: [label, 0.8], topic: ["physical-ai", 1], contribution: ["method", 1], significance: [1.4, 0.7] },
});

test("compare: runs every model on the gold set, skips answered pairs, scores all models against gold", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    await mkdir(join(rootDir, "data"));
    const gold = [["a", "core"], ["b", "adjacent"], ["c", "irrelevant"]];
    await writeFile(join(rootDir, "data", "gold.jsonl"), gold.map(([id, label]) => JSON.stringify({ id, label, source: "panel", runDate: "2026-09-21" })).join("\n") + "\n");
    await writeFile(join(rootDir, "data", "papers.jsonl"), JSON.stringify({ id: "a", runDate: "2026-09-21", title: "Stored title A" }) + "\n");
    const prior = [record("a", "jev", "jev-1", "core"), record("b", "jev", "jev-1", "core"), record("c", "jev", "jev-1", "irrelevant"), record("a", "openai", "m1", "core")];
    await writeFile(join(rootDir, "data", "decisions.jsonl"), prior.map((d) => JSON.stringify(d)).join("\n") + "\n");

    const m1 = fake("m1", { b: "adjacent", c: "core" });
    const m2 = fake("m2", { a: "irrelevant", b: "irrelevant", c: "irrelevant" });
    const config = { ...baseConfig, models: { ...baseConfig.models, pricing: { m1: { input: 1, output: 10 } } } };
    const fetched: string[][] = [];
    const md = await compare({ rootDir, config, backends: [m1, m2], fetchPapers: async (ids) => (fetched.push(ids), ids.map(paper)) });

    assert.deepEqual(fetched, [["a", "b", "c"]], "papers are fetched once for all models");
    assert.deepEqual(m1.asked.sort(), ["b", "c"], "a was already answered by m1");
    assert.deepEqual(m2.asked.sort(), ["a", "b", "c"]);
    const log = await readJsonl<DecisionRecord>(join(rootDir, "data", "decisions.jsonl"));
    assert.equal(log.length, prior.length + 5);
    assert.equal(log.at(-1)?.outputTokens, 100);
    assert.ok((log.at(-1)?.latencyMs ?? -1) >= 0);

    // Jev: 2/3 labels right; include right on all 3. m1: b right, c wrong (core). m2: only c right; predicts no include.
    assert.match(md, /\| jev:jev-1 \| - \| 3 \| 67% \| 100% \| 100% \| 100% \| 500 \| 0 \| 20 ms \| - \|/);
    assert.match(md, /\| openai:m1 \| - \| 3 \| 67% \| 67% \| 67% \| 100% \| 833 \| 67 \| \d+ ms \| \$1\.50 \|/);
    assert.match(md, /\| openai:m2 \| - \| 3 \| 33% \| 33% \| - \| 0% \|/);
    assert.match(md, /## jev:jev-1 vs openai:m1: label disagreements \(2\)/);
    assert.match(md, /\| \[b\]\(https:\/\/arxiv\.org\/abs\/b\) \| adjacent \| core \(0\.8\) \| adjacent \(0\.9\) \| Paper b \|/);
    assert.match(md, /\| \[a\]\(https:\/\/arxiv\.org\/abs\/a\) \| core \| core \(0\.8\) \| irrelevant \(0\.9\) \| Paper a \|/, "a fetched title wins");

    // Render-only: no backends, no fetch, same scores; titles come from papers.jsonl.
    const again = await compare({ rootDir, config, backends: [], fetchPapers: async () => assert.fail("must not fetch") });
    assert.equal(again.split("\n## ")[0], md.split("\n## ")[0]);
    assert.match(again, /\| \[a\]\(https:\/\/arxiv\.org\/abs\/a\) \| core \| core \(0\.8\) \| irrelevant \(0\.9\) \| Stored title A \|/);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("costUsd: per-call USD from per-million prices, undefined for unknown models", () => {
  assert.equal(costUsd(1_000_000, 500_000, "m", { m: { input: 2, output: 8 } }), 6);
  assert.equal(costUsd(10, 10, "other", { m: { input: 2, output: 8 } }), undefined);
});
