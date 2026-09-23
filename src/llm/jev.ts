import { TypeSafeClient } from "@typesafe-ai/sdk";
import type {
  ChoiceResponse,
  EntryType,
  NoulResponse,
  Questions as SdkQuestions,
  ScoreResponse,
} from "@typesafe-ai/sdk";
import type { AnswersFor, AskResult, DecisionBackend, Questions, State } from "./backend.ts";

type SdkAnswer = NoulResponse | ChoiceResponse | ScoreResponse;

/** The one SDK method this backend needs. Narrow on purpose so tests can fake it. */
export interface SystemOneClient {
  systemOne(request: { state: EntryType; questions: SdkQuestions; model?: string }): PromiseLike<{
    readonly model: string;
    readonly answers: { readonly [name: string]: SdkAnswer };
    readonly usage: { readonly input_tokens: number };
  }>;
}

export function toSdkQuestions(questions: Questions): SdkQuestions {
  const out: SdkQuestions = {};
  for (const [name, q] of Object.entries(questions)) {
    if (q.type === "choice") {
      out[name] = { type: "choice", instructions: q.instructions, criteria: q.options };
    } else if (q.type === "noul") {
      out[name] = { type: "noul", instructions: q.instructions };
    } else {
      const [first, second, ...rest] = q.levels;
      if (first === undefined || second === undefined) throw new Error(`score question "${name}" needs at least 2 levels`);
      out[name] = { type: "score", instructions: q.instructions, criteria: [first, second, ...rest] };
    }
  }
  return out;
}

/** TypeSafe Jev: one request answers every question, each with calibrated probabilities. */
export class JevDecisionBackend implements DecisionBackend {
  readonly id = "jev";
  readonly model: string;
  readonly #client: SystemOneClient;

  constructor(client: SystemOneClient, model: string) {
    this.#client = client;
    this.model = model;
  }

  async ask<const Q extends Questions>(state: State, questions: Q): Promise<AskResult<Q>> {
    const response = await this.#client.systemOne({
      state: state as EntryType,
      questions: toSdkQuestions(questions),
      model: this.model,
    });

    const answers: Record<string, unknown> = {};
    for (const [name, q] of Object.entries(questions)) {
      const a = response.answers[name];
      if (!a || a.type !== q.type) {
        throw new Error(`jev: answer "${name}" is ${a ? `a ${a.type}` : "missing"}, expected a ${q.type}`);
      }
      if (a.type === "choice") {
        answers[name] = { type: "choice", choice: a.choice, confidence: a.confidence, probabilities: { ...a.probabilities } };
      } else if (a.type === "noul") {
        answers[name] = { type: "noul", probability: a.noul };
      } else {
        answers[name] = { type: "score", score: a.score, confidence: a.confidence };
      }
    }
    return {
      answers: answers as AnswersFor<Q>,
      backend: this.id,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: 0,
    };
  }
}

export function createJevClient(apiKey: string): SystemOneClient {
  // The SDK retries 429 / 529 / connection errors with backoff on its own.
  return new TypeSafeClient({ apiKey, timeout: 30_000, retry: { maxRetries: 4 } });
}
