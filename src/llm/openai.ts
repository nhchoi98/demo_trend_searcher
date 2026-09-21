import OpenAI from "openai";
import type {
  AnswersFor,
  AskResult,
  DecisionBackend,
  JsonSchema,
  Questions,
  State,
  TextBackend,
  TextSpec,
} from "./backend.ts";

interface Structured<T> {
  value: T;
  inputTokens: number;
}

async function structured<T>(
  client: OpenAI,
  model: string,
  name: string,
  system: string,
  user: string,
  schema: JsonSchema,
): Promise<Structured<T>> {
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
  return { value: JSON.parse(content) as T, inputTokens: completion.usage?.prompt_tokens ?? 0 };
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/**
 * Imitates the System One question shape with a generative LLM, so the same
 * loop can run on either backend and the escalation path has somewhere to go.
 *
 * The numbers are NOT equivalent: Jev's probabilities come from the model's
 * output distribution, these are figures the LLM writes down about itself.
 * Compare them on a labelled set before trusting one threshold for both.
 */
export class OpenAIDecisionBackend implements DecisionBackend {
  readonly id = "openai";
  readonly model: string;
  readonly #client: OpenAI;

  constructor(client: OpenAI, model: string) {
    this.#client = client;
    this.model = model;
  }

  async ask<const Q extends Questions>(state: State, questions: Q): Promise<AskResult<Q>> {
    // Question names may contain characters a JSON-schema property should not,
    // so the model sees q0, q1, ... and the names are mapped back afterwards.
    const names = Object.keys(questions);
    const properties: Record<string, JsonSchema> = {};
    const brief: string[] = [];
    const num = { type: "number" };

    names.forEach((name, i) => {
      const q = questions[name];
      if (!q) return;
      const key = `q${i}`;
      const object = (props: Record<string, JsonSchema>): JsonSchema => ({
        type: "object",
        additionalProperties: false,
        required: Object.keys(props),
        properties: props,
      });
      if (q.type === "choice") {
        properties[key] = object({ choice: { type: "string", enum: Object.keys(q.options) }, confidence: num });
        const options = Object.entries(q.options).map(([k, d]) => `    - ${k}${d ? `: ${d}` : ""}`);
        brief.push(`${key} (choose exactly one): ${q.instructions}`, ...options);
      } else if (q.type === "noul") {
        properties[key] = object({ probability: num });
        brief.push(`${key} (probability 0..1 that the answer is yes): ${q.instructions}`);
      } else {
        properties[key] = object({ level: { type: "integer", enum: q.levels.map((_, l) => l) }, confidence: num });
        brief.push(`${key} (pick the level that fits best): ${q.instructions}`, ...q.levels.map((d, l) => `    ${l}: ${d}`));
      }
    });

    const system = [
      "Answer every question about the provided state. Use the state only, no outside knowledge about it.",
      "`confidence` is the probability from 0 to 1 that your answer to that question is correct.",
      "",
      ...brief,
    ].join("\n");
    const user = typeof state === "string" ? state : JSON.stringify(state, null, 2);
    const schema: JsonSchema = { type: "object", additionalProperties: false, required: Object.keys(properties), properties };

    type Raw = Record<string, { choice?: string; level?: number; confidence?: number; probability?: number }>;
    const { value: raw, inputTokens } = await structured<Raw>(this.#client, this.model, "decisions", system, user, schema);

    const answers: Record<string, unknown> = {};
    names.forEach((name, i) => {
      const q = questions[name];
      const a = raw[`q${i}`];
      if (!q || !a) throw new Error(`openai: answer "${name}" is missing`);
      if (q.type === "choice") {
        answers[name] = { type: "choice", choice: a.choice ?? "", confidence: clamp01(a.confidence ?? 0) };
      } else if (q.type === "noul") {
        answers[name] = { type: "noul", probability: clamp01(a.probability ?? 0) };
      } else {
        answers[name] = { type: "score", score: a.level ?? 0, confidence: clamp01(a.confidence ?? 0) };
      }
    });
    return { answers: answers as AnswersFor<Q>, backend: this.id, model: this.model, inputTokens };
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

  async write<T>(spec: TextSpec, input: string): Promise<T> {
    return (await structured<T>(this.#client, this.model, spec.name, spec.instruction, input, spec.outputSchema)).value;
  }
}

export function createOpenAIClient(apiKey: string): OpenAI {
  // The SDK already retries 429/5xx with backoff.
  return new OpenAI({ apiKey, maxRetries: 4, timeout: 120_000 });
}
