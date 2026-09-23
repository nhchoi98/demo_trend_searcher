import assert from "node:assert/strict";
import { test } from "node:test";
import type Anthropic from "@anthropic-ai/sdk";
import baseConfig from "../finder.config.ts";
import { AnthropicDecisionBackend } from "../src/llm/anthropic.ts";
import { decisionSchema } from "../src/llm/openai.ts";
import { combine, triageQuestions } from "../src/loops/triage.ts";

test("anthropic backend: same schema as the OpenAI imitation, answers parsed from the structured output", async () => {
  const questions = triageQuestions(baseConfig);
  const { schema } = decisionSchema(questions);
  const n = Object.keys(questions).length;
  const raw: Record<string, unknown> = {};
  Object.entries(questions).forEach(([name, q], i) => {
    raw[`q${i}`] = q.type === "choice" ? { choice: name === "label" ? "adjacent" : Object.keys(q.options)[0], confidence: 0.7 } : q.type === "noul" ? { probability: 0.9 } : { level: 2, confidence: 0.6 };
  });

  const requests: unknown[] = [];
  const fake = {
    messages: {
      create: async (params: unknown) => {
        requests.push(params);
        return { model: "claude-haiku-4-5-20251001", stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(raw) }], usage: { input_tokens: 900, output_tokens: 150 } };
      },
    },
  } as unknown as Anthropic;

  const backend = new AnthropicDecisionBackend(fake, "claude-haiku-4-5");
  const result = await backend.ask({ title: "T", categories: ["cs.RO"], abstract: "A" }, questions);
  const req = requests[0] as { model: string; system: string; output_config: { format: { type: string; schema: unknown } }; messages: Array<{ content: string }> };
  assert.equal(req.model, "claude-haiku-4-5");
  assert.deepEqual(req.output_config.format, { type: "json_schema", schema });
  assert.equal(Object.keys((schema as { properties: object }).properties).length, n);
  assert.match(req.system, /q0 \(choose exactly one\)/);
  assert.match(req.messages[0]?.content ?? "", /"title": "T"/);
  assert.deepEqual([result.backend, result.model, result.served, result.inputTokens, result.outputTokens], ["anthropic", "claude-haiku-4-5", "claude-haiku-4-5-20251001", 900, 150]);
  const triage = combine(result, baseConfig);
  assert.equal(triage.label, "adjacent");
  assert.equal(triage.significance, 2);
  assert.ok(triage.tags.length > 0, "noul 0.9 clears tagThreshold");
});

test("anthropic backend: refusal and truncation are errors, not silent zeros", async () => {
  const stub = (stop_reason: string) =>
    ({ messages: { create: async () => ({ model: "m", stop_reason, stop_details: { category: "cyber" }, content: [], usage: { input_tokens: 1, output_tokens: 1 } }) } }) as unknown as Anthropic;
  await assert.rejects(new AnthropicDecisionBackend(stub("refusal"), "m").ask("s", triageQuestions(baseConfig)), /refused \(cyber\)/);
  await assert.rejects(new AnthropicDecisionBackend(stub("max_tokens"), "m").ask("s", triageQuestions(baseConfig)), /truncated/);
});
