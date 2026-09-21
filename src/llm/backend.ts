/**
 * Two narrow interfaces instead of one "LLM client":
 *
 *  - DecisionBackend: unstructured state in, typed value + confidence out.
 *    Small, cheap, many calls. This is the seam where a System-One style model
 *    (e.g. Jev) can be swapped in and compared against an LLM.
 *  - TextBackend: prose generation. Always a generative LLM.
 *
 * Every loop in src/loops talks to these interfaces only.
 */

export type JsonSchema = Record<string, unknown>;

export interface DecisionSpec {
  /** Loop name, e.g. "relevance". Also used as the log key. */
  name: string;
  /** What is being decided, in plain language. */
  instruction: string;
  /** JSON Schema of the decision value (object, all props required, no extras). */
  valueSchema: JsonSchema;
}

export interface Decision<T> {
  value: T;
  /** 0..1. Whether this number can be trusted is exactly what decisions.jsonl lets you measure. */
  confidence: number;
  reason?: string;
  backend: string;
  model: string;
}

export interface DecisionBackend {
  readonly id: string;
  readonly model: string;
  decide<T>(spec: DecisionSpec, state: string): Promise<Decision<T>>;
}

export interface TextSpec {
  name: string;
  instruction: string;
  /** JSON Schema of the structured prose output. */
  outputSchema: JsonSchema;
}

export interface TextBackend {
  readonly id: string;
  readonly model: string;
  write<T>(spec: TextSpec, input: string): Promise<T>;
}
