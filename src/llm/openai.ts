import OpenAI from "openai";
import type { Decision, DecisionBackend, DecisionSpec, JsonSchema, TextBackend, TextSpec } from "./backend.ts";

async function structured<T>(
  client: OpenAI,
  model: string,
  name: string,
  system: string,
  user: string,
  schema: JsonSchema,
): Promise<T> {
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name, strict: true, schema },
    },
  });
  const choice = completion.choices[0];
  if (choice?.message.refusal) throw new Error(`${name}: model refused: ${choice.message.refusal}`);
  if (choice?.finish_reason === "length") throw new Error(`${name}: output truncated`);
  const content = choice?.message.content;
  if (!content) throw new Error(`${name}: empty completion`);
  return JSON.parse(content) as T;
}

export class OpenAIDecisionBackend implements DecisionBackend {
  readonly id = "openai";
  readonly model: string;
  readonly #client: OpenAI;

  constructor(client: OpenAI, model: string) {
    this.#client = client;
    this.model = model;
  }

  async decide<T>(spec: DecisionSpec, state: string): Promise<Decision<T>> {
    // The confidence here is self-reported by the LLM, not a calibrated
    // probability. Treat it as a hypothesis to test against a labelled set.
    const schema: JsonSchema = {
      type: "object",
      additionalProperties: false,
      required: ["value", "confidence", "reason"],
      properties: {
        value: spec.valueSchema,
        confidence: { type: "number", description: "Probability from 0 to 1 that `value` is correct." },
        reason: { type: "string", description: "One short sentence." },
      },
    };
    const out = await structured<{ value: T; confidence: number; reason: string }>(
      this.#client,
      this.model,
      spec.name,
      `${spec.instruction}\n\nDecide from the provided text only. Do not use outside knowledge about the paper.`,
      state,
      schema,
    );
    return {
      value: out.value,
      confidence: Math.min(1, Math.max(0, out.confidence)),
      reason: out.reason,
      backend: this.id,
      model: this.model,
    };
  }
}

export class OpenAITextBackend implements TextBackend {
  readonly id = "openai";
  readonly model: string;
  readonly #client: OpenAI;

  constructor(client: OpenAI, model: string) {
    this.#client = client;
    this.model = model;
  }

  write<T>(spec: TextSpec, input: string): Promise<T> {
    return structured<T>(this.#client, this.model, spec.name, spec.instruction, input, spec.outputSchema);
  }
}

export function createOpenAIClient(apiKey: string): OpenAI {
  // The SDK already retries 429/5xx with backoff.
  return new OpenAI({ apiKey, maxRetries: 4, timeout: 120_000 });
}
