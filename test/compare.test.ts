import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import baseConfig from "../finder.config.ts";
import { compare } from "../src/compare.ts";
import type { AskResult, DecisionBackend, Questions } from "../src/llm/backend.ts";
import { readJsonl } from "../src/store.ts";
import type { DecisionRecord, Paper } from "../src/types.ts";

const paper = (id: string): Paper => ({
  id, version: 1, title: `Paper ${id}`, abstract: "x", authors: [], published: "2026-09-21T00:00:00Z", updated: "", categories: ["cs.AI"], url: "", pdfUrl: "", matchedTopics: [],
});

function fake(label: string): DecisionBackend & { asked: string[] } {
  return {
    id: "openai", model: "gpt-test", asked: [],
    async ask<const Q extends Questions>(state: unknown, questions: Q): Promise<AskResult<Q>> {
      this.asked.push((state as { title: string }).title);
      const answers: Record<string, unknown> = {};
      for (const [name, q] of Object.entries(questions)) {
        answers[name] = q.type === "choice" ? { type: "choice", choice: name === "label" ? label : Object.keys(q.options)[0], confidence: 0.9 }
          : q.type === "noul" ? { type: "noul", probability: 0.1 } : { type: "score", score: 1, confidence: 0.9 };
      }
      return { answers: answers as AskResult<Q>["answers"], backend: "openai", model: "gpt-test", inputTokens: 1 };
    },
  };
}

test("compare replays only unanswered papers and reports label disagreements", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "trend-finder-"));
  try {
    await mkdir(join(rootDir, "data"));
    const seen = [{ id: "a", runDate: "2026-09-21" }, { id: "b", runDate: "2026-09-21" }, { id: "old", runDate: "2026-09-01" }];
    await writeFile(join(rootDir, "data", "papers.jsonl"), seen.map((s) => JSON.stringify(s)).join("\n") + "\n");
    const jev = (id: string, label: string): DecisionRecord => ({
      ts: "", loop: "triage", subjectId: id, backend: "jev", model: "jev-1", inputHash: "h", inputTokens: 1,
      answers: { label: [label, 0.8], topic: ["physical-ai", 1], contribution: ["method", 1], significance: [1.4, 0.7] },
    });
    const prior: DecisionRecord = { ...jev("b", "core"), backend: "openai", model: "gpt-test", answers: { label: ["core", 0.9], topic: ["physical-ai", 1], contribution: ["method", 1], significance: [1, 0.9] } };
    await writeFile(join(rootDir, "data", "decisions.jsonl"), [jev("a", "core"), jev("b", "core"), prior].map((d) => JSON.stringify(d)).join("\n") + "\n");

    const backend = fake("irrelevant");
    const md = await compare({ rootDir, config: baseConfig, backend, date: "2026-09-21", fetchPapers: async (ids) => ids.map(paper) });

    assert.deepEqual(backend.asked, ["Paper a"]); // b was already answered, old is another day
    const records = await readJsonl<DecisionRecord>(join(rootDir, "data", "decisions.jsonl"));
    assert.equal(records.filter((d) => d.backend === "openai").length, 2);
    assert.match(md, /\| label \| 50% \|/);
    assert.match(md, /\| \[a\]\(https:\/\/arxiv\.org\/abs\/a\) \| core \(0\.8\) \| irrelevant \(0\.9\) \| Paper a \|/);
    assert.doesNotMatch(md, /\| \[b\]/);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
