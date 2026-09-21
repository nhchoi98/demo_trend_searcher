/**
 * Two narrow interfaces instead of one "LLM client".
 *
 * DecisionBackend is shaped after TypeSafe's System One API (Jev), because that
 * is the backend the gate is built for: you send a `state` plus a map of small
 * typed questions, and every answer comes back with its own probability or
 * confidence. Three question types exist, and nothing else:
 *
 *   - choice: pick exactly one option        -> choice + confidence + probabilities
 *   - noul:   yes/no                         -> probability that the answer is yes
 *   - score:  rate against ordered levels    -> probability-weighted level + confidence
 *
 * All questions of one call are answered together, so asking ten things about a
 * paper costs one request ("fan-out"). A generative LLM can imitate this shape
 * (see openai.ts), which is what makes the two comparable on the same log.
 *
 * TextBackend is prose generation and is always a generative LLM: Jev cannot
 * produce text.
 *
 * Loops in src/loops talk to these interfaces only.
 */

export interface ChoiceQuestion {
  type: "choice";
  instructions: string;
  /** option key -> description of when it applies (null = the key says it all). Max 255 options. */
  options: Record<string, string | null>;
}

export interface NoulQuestion {
  type: "noul";
  instructions: string;
}

export interface ScoreQuestion {
  type: "score";
  instructions: string;
  /** Ordered level descriptions, lowest first. 2 to 10 levels. */
  levels: readonly string[];
}

export type Question = ChoiceQuestion | NoulQuestion | ScoreQuestion;
export type Questions = Record<string, Question>;

export interface ChoiceAnswer {
  type: "choice";
  choice: string;
  /** 0..1, derived from how concentrated the probability distribution is. */
  confidence: number;
  probabilities?: Record<string, number>;
}

export interface NoulAnswer {
  type: "noul";
  /** Probability that the answer is yes. A noul has no separate confidence. */
  probability: number;
}

export interface ScoreAnswer {
  type: "score";
  /** Probability-weighted level index, e.g. 1.4 on a 0..3 scale. */
  score: number;
  confidence: number;
}

export type AnswerFor<Q extends Question> = Q extends ChoiceQuestion
  ? ChoiceAnswer
  : Q extends NoulQuestion
    ? NoulAnswer
    : ScoreAnswer;

export type AnswersFor<Q extends Questions> = { [K in keyof Q]: AnswerFor<Q[K]> };

export interface AskResult<Q extends Questions> {
  answers: AnswersFor<Q>;
  backend: string;
  /** The concrete model that answered (e.g. "jev-1.13.0"), not the alias that was requested. */
  model: string;
  inputTokens: number;
}

/** JSON-like state. Keep it to what the decision needs: unrelated content lowers accuracy. */
export type State = string | { [key: string]: State } | State[] | number | boolean | null;

export interface DecisionBackend {
  readonly id: string;
  readonly model: string;
  ask<const Q extends Questions>(state: State, questions: Q): Promise<AskResult<Q>>;
}

export type JsonSchema = Record<string, unknown>;

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
