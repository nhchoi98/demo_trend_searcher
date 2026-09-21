import type { FinderConfig } from "../config.ts";
import type { TextBackend, TextSpec } from "../llm/backend.ts";
import type { Paper, Summary } from "../types.ts";
import { paperState } from "./relevance.ts";

export function summarySpec(config: FinderConfig): TextSpec {
  const sentence = { type: "string", description: "One or two plain sentences." };
  return {
    name: "summary",
    instruction: [
      `Summarize the paper for a technical reader. Write in ${config.report.language}; keep model, dataset and method names in their original form.`,
      "Use ONLY what the title and abstract state. If the abstract gives no quantitative result, say so instead of inventing one.",
      "Do not include citations, links, or author names: references are attached by the program.",
      "Plain prose, no markdown, no bullet points.",
    ].join("\n"),
    outputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["oneLiner", "problem", "method", "results", "whyItMatters"],
      properties: {
        oneLiner: { type: "string", description: "One sentence a busy reader can stop at." },
        problem: sentence,
        method: sentence,
        results: sentence,
        whyItMatters: sentence,
      },
    },
  };
}

/** Loop 2: prose summary. References are never generated here, only in report.ts. */
export function summarize(paper: Paper, config: FinderConfig, backend: TextBackend): Promise<Summary> {
  return backend.write<Summary>(summarySpec(config), paperState(paper));
}
