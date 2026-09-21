import type { State } from "./llm/backend.ts";
import type { Paper } from "./types.ts";

/**
 * What a model gets to see of a paper. Deliberately small: decision accuracy
 * drops when the state carries content unrelated to the question.
 */
export function paperState(paper: Paper): State {
  return { title: paper.title, categories: paper.categories, abstract: paper.abstract };
}

export function paperText(paper: Paper): string {
  return [`Title: ${paper.title}`, `Categories: ${paper.categories.join(", ")}`, `Abstract: ${paper.abstract}`].join("\n");
}
