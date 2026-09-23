import Anthropic from "@anthropic-ai/sdk";
import type { AskResult, DecisionBackend, Questions, State } from "./backend.ts";
import { decisionSchema, stateText } from "./openai.ts";

/**
 * Claude answering the same fan-out questions through structured outputs
 * (`output_config.format`), so its labels land in decisions.jsonl next to
 * Jev's and OpenAI's. Same caveat as openai.ts: the confidences are
 * self-reported, only the labels are comparable.
 */
export class AnthropicDecisionBackend implements DecisionBackend {
  readonly id = "anthropic";
  readonly model: string;
  readonly #client: Anthropic;

  constructor(client: Anthropic, model: string) {
    this.#client = client;
    this.model = model;
  }

  async ask<const Q extends Questions>(state: State, questions: Q): Promise<AskResult<Q>> {
    const { system, schema, parse } = decisionSchema(questions);
    const response = await this.#client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: stateText(state) }],
      output_config: { format: { type: "json_schema", schema } },
    });
    if (response.stop_reason === "refusal") throw new Error(`anthropic: model refused (${response.stop_details?.category ?? "no category"})`);
    if (response.stop_reason === "max_tokens") throw new Error("anthropic: output truncated");
    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) throw new Error("anthropic: empty completion");
    return {
      answers: parse(JSON.parse(text) as Parameters<typeof parse>[0]),
      backend: this.id,
      model: this.model,
      ...(response.model !== this.model ? { served: response.model } : {}),
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }
}

export function createAnthropicClient(apiKey: string): Anthropic {
  // The SDK retries 429/5xx and connection errors on its own.
  return new Anthropic({ apiKey, maxRetries: 4, timeout: 120_000 });
}
