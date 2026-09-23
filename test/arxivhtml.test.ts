import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fetchArxivHtml, parseArxivHtml } from "../src/sources/arxivhtml.ts";
import type { Paper } from "../src/types.ts";

const paper = { id: "2609.21045", version: 1 } as Paper;

test("parseArxivHtml: affiliations, first figure and repo links from a LaTeXML page", async () => {
  const meta = parseArxivHtml(await readFile(new URL("./fixtures/arxiv-html.html", import.meta.url), "utf8"));
  assert.deepEqual(meta.affiliations, ["The University of Texas at Austin", "NVIDIA Research & UT Austin"]);
  assert.equal(meta.imageUrl, "https://arxiv.org/html/2609.21045v1/Figure/Final/workflow_part1.jpg");
  assert.deepEqual(meta.links, ["https://github.com/ut-austin-rpl/dextera", "https://huggingface.co/ut-austin-rpl/dextera-policy"], "LaTeXML / arXiv links are noise");
});

test("parseArxivHtml: affiliations written after a line break in the author name", () => {
  const html = `<span class="ltx_personname">Ada Example<br class="ltx_break">1,2 NVIDIA Research<br class="ltx_break">ada@example.com</span><span class="ltx_personname">Bo Sample<br class="ltx_break">Stanford University</span>`;
  assert.deepEqual(parseArxivHtml(html).affiliations, ["NVIDIA Research", "Stanford University"]);
  assert.deepEqual(parseArxivHtml("<p>no authors, no figures</p>"), { affiliations: [], links: [] });
});

test("fetchArxivHtml: a missing page is an empty meta, not a failed paper", async () => {
  const urls: string[] = [];
  const meta = await fetchArxivHtml(paper, async (url) => (urls.push(url), Promise.reject(new Error("arXiv responded 404"))));
  assert.deepEqual(urls, ["https://arxiv.org/html/2609.21045v1"]);
  assert.deepEqual(meta, { affiliations: [], links: [] });
});
