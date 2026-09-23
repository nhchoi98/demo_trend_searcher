import assert from "node:assert/strict";
import { test } from "node:test";
import base from "../finder.config.ts";
import type { AskResult, Questions } from "../src/llm/backend.ts";
import { JevDecisionBackend, toSdkQuestions, type SystemOneClient } from "../src/llm/jev.ts";
import { combine, triageQuestions } from "../src/loops/triage.ts";

test("triageQuestions fans out: 4 fixed questions plus one yes/no per tag", () => {
  const q = triageQuestions(baseConfig);
  const tagCount = Object.keys(baseConfig.tags).length;
  assert.equal(Object.keys(q).length, 4 + tagCount);
  assert.equal(q.label?.type, "choice");
  assert.equal(q.significance?.type, "score");
  assert.equal(q["tag:vla"]?.type, "noul");
  const topic = q.topic;
  assert.ok(topic?.type === "choice");
  assert.deepEqual(Object.keys(topic.options), [...baseConfig.topics.map((t) => t.key), "none"]);
});

function result(
  label: string,
  labelConfidence: number,
  significance: number,
  tags: Record<string, number>,
  probabilities?: Record<string, number>,
): AskResult<Questions> {
  return {
    backend: "x",
    model: "m",
    inputTokens: 0,
    outputTokens: 0,
    answers: {
      label: { type: "choice", choice: label, confidence: labelConfidence, ...(probabilities ? { probabilities } : {}) },
      topic: { type: "choice", choice: "world-model", confidence: 0.8 },
      contribution: { type: "choice", choice: "method", confidence: 0.8 },
      significance: { type: "score", score: significance, confidence: 0.6 },
      ...Object.fromEntries(Object.entries(tags).map(([k, p]) => [`tag:${k}`, { type: "noul" as const, probability: p }])),
    },
  };
}

// The priority floor is exercised in its own test; the others look at the label gate alone.
const baseConfig = { ...base, gate: { ...base.gate, minPriority: 0 } };

test("combine applies the tag threshold and the priority weights in code", () => {
  const triage = combine(result("adjacent", 0.62, 1.5, { vla: 0.5, sim2real: 0.49, cosmos: 0.97 }), baseConfig);
  assert.deepEqual(triage.tags, ["vla", "cosmos"]);
  assert.equal(triage.labelConfidence, 0.62);
  // (0.6 * 0.5 + 0.4 * (1.5 / 3)) / (0.6 + 0.4) = 0.5
  assert.equal(triage.priority, 0.5);
  assert.equal(combine(result("irrelevant", 0.99, 0, {}), baseConfig).priority, 0);
});

test("combine decides inclusion from the probability distribution, not just the winning label", () => {
  // The single most likely label is "irrelevant", but core + adjacent outweigh it.
  const split = combine(result("irrelevant", 0.1, 0, {}, { core: 0.3, adjacent: 0.3, irrelevant: 0.4 }), baseConfig);
  assert.equal(split.includeProbability, 0.6);
  assert.equal(split.included, true);
  assert.equal(split.borderline, true, "included on a split vote, so the reader is asked to make the call");
  // Expected relevance 0.3*1 + 0.3*0.5 = 0.45 -> priority 0.6*0.45 = 0.27
  assert.equal(split.priority, 0.27);

  const clear = combine(result("irrelevant", 0.85, 0, {}, { core: 0.02, adjacent: 0.08, irrelevant: 0.9 }), baseConfig);
  assert.equal(clear.included, false);
  assert.equal(clear.borderline, false);

  const sure = combine(result("core", 0.91, 3, {}, { core: 0.94, adjacent: 0.05, irrelevant: 0.01 }), baseConfig);
  assert.equal(sure.included, true);
  assert.equal(sure.borderline, false);
});

test("combine falls back to the chosen label when the backend gives no distribution", () => {
  assert.equal(combine(result("adjacent", 0.9, 1, {}), baseConfig).includeProbability, 1);
  assert.equal(combine(result("irrelevant", 0.9, 1, {}), baseConfig).included, false);
});

test("combine drops a paper whose priority is under gate.minPriority even when the label passes", () => {
  const floor = { ...baseConfig, gate: { ...baseConfig.gate, minPriority: 0.7 } };
  const dist = { core: 0.9, adjacent: 0.05, irrelevant: 0.05 };
  const pass = combine(result("core", 0.9, 3, {}, dist), floor);
  assert.equal(pass.included, true, `priority ${pass.priority} clears the floor`);
  const low = combine(result("core", 0.9, 0, {}, dist), floor);
  assert.equal(low.included, false, `priority ${low.priority} is under the floor`);
});

test("combine mixes the author h-index into priority only when it is known", () => {
  const w = baseConfig.gate.priorityWeights;
  const cap = baseConfig.gate.authorHIndexCap;
  const r3 = (n: number): number => Math.round(n * 1000) / 1000;
  const unknown = combine(result("core", 0.9, 3, {}), baseConfig);
  assert.equal(unknown.priority, 1, "core + top significance, no author term");
  assert.equal("authorHIndex" in unknown, false);
  const half = combine(result("core", 0.9, 3, {}), baseConfig, { authorHIndex: cap / 2 });
  assert.equal(half.priority, r3((w.label + w.significance + w.author * 0.5) / (w.label + w.significance + w.author)));
  assert.equal(half.authorHIndex, cap / 2);
  const star = combine(result("core", 0.9, 3, {}), baseConfig, { authorHIndex: cap * 3 });
  assert.equal(star.priority, 1, "h-index saturates at the cap");
});

test("combine rejects an answer set it cannot trust", () => {
  assert.throws(() => combine(result("maybe", 0.9, 1, {}), baseConfig), /unknown label "maybe"/);
  const broken = result("core", 0.9, 1, {});
  delete (broken.answers as Record<string, unknown>).topic;
  assert.throws(() => combine(broken, baseConfig), /incomplete answer set/);
});

test("toSdkQuestions maps options/levels onto the API's `criteria`", () => {
  assert.deepEqual(
    toSdkQuestions({
      a: { type: "choice", instructions: "pick", options: { x: "ex", y: null } },
      b: { type: "noul", instructions: "yes?" },
      c: { type: "score", instructions: "rate", levels: ["low", "high"] },
    }),
    {
      a: { type: "choice", instructions: "pick", criteria: { x: "ex", y: null } },
      b: { type: "noul", instructions: "yes?" },
      c: { type: "score", instructions: "rate", criteria: ["low", "high"] },
    },
  );
  assert.throws(() => toSdkQuestions({ c: { type: "score", instructions: "rate", levels: ["only one"] } }), /at least 2 levels/);
});

test("JevDecisionBackend sends one request and normalizes the three answer types", async () => {
  const requests: unknown[] = [];
  const client: SystemOneClient = {
    async systemOne(request) {
      requests.push(request);
      return {
        model: "jev-1.13.0",
        usage: { input_tokens: 321 },
        answers: {
          a: { type: "choice", choice: "x", confidence: 0.81, probabilities: { x: 0.88, y: 0.12 } },
          b: { type: "noul", noul: 0.95 },
          c: { type: "score", score: 1.05, confidence: 0.92, legend: {}, probabilities: {} },
        },
      };
    },
  };
  const backend = new JevDecisionBackend(client, "jev-latest");
  const out = await backend.ask(
    { title: "T" },
    {
      a: { type: "choice", instructions: "pick", options: { x: null, y: null } },
      b: { type: "noul", instructions: "yes?" },
      c: { type: "score", instructions: "rate", levels: ["low", "mid", "high"] },
    },
  );
  assert.equal(requests.length, 1);
  assert.deepEqual((requests[0] as { model: string; state: unknown }).state, { title: "T" });
  assert.equal((requests[0] as { model: string }).model, "jev-latest");
  assert.equal(out.model, "jev-1.13.0", "logs the concrete model, not the alias");
  assert.equal(out.inputTokens, 321);
  assert.deepEqual(out.answers.a, { type: "choice", choice: "x", confidence: 0.81, probabilities: { x: 0.88, y: 0.12 } });
  assert.deepEqual(out.answers.b, { type: "noul", probability: 0.95 });
  assert.deepEqual(out.answers.c, { type: "score", score: 1.05, confidence: 0.92 });
});

test("JevDecisionBackend fails loudly when an answer is missing or of the wrong type", async () => {
  const client: SystemOneClient = {
    async systemOne() {
      return { model: "jev", usage: { input_tokens: 1 }, answers: { a: { type: "noul", noul: 0.5 } } };
    },
  };
  const backend = new JevDecisionBackend(client, "jev-latest");
  await assert.rejects(backend.ask("s", { a: { type: "choice", instructions: "pick", options: { x: null, y: null } } }), /"a" is a noul, expected a choice/);
  await assert.rejects(backend.ask("s", { z: { type: "noul", instructions: "yes?" } }), /"z" is missing/);
});
