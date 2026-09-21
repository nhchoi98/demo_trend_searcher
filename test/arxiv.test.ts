import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import baseConfig from "../finder.config.ts";
import { buildCategoryQuery, buildQuery, fetchArxiv, matchTopics, parseFeed, parseFeedPage } from "../src/sources/arxiv.ts";

const fixture = new URL("./fixtures/arxiv-feed.xml", import.meta.url);

test("parseFeed extracts version-less ids, clean text, and metadata", async () => {
  const papers = parseFeed(await readFile(fixture, "utf8"), "world-model");
  assert.equal(papers.length, 2);

  const [first, second] = papers;
  assert.equal(first?.id, "2609.01234");
  assert.equal(first?.version, 2);
  assert.equal(first?.title, "A Fixture World Model for Testing & Parsing");
  assert.equal(first?.abstract, "We present a made-up world model. It exists only to test the parser.");
  assert.deepEqual(first?.authors, ["Ada Example", "Bo Sample", "Cy Placeholder", "Di Fourth"]);
  assert.deepEqual(first?.categories, ["cs.CV", "cs.RO"]);
  assert.equal(first?.url, "https://arxiv.org/abs/2609.01234");
  assert.equal(first?.pdfUrl, "http://arxiv.org/pdf/2609.01234v2");
  assert.deepEqual(first?.matchedTopics, ["world-model"]);

  // Single author / single category must still come back as arrays,
  // and a numeric-looking title must stay a string.
  assert.deepEqual(second?.authors, ["Solo Author"]);
  assert.deepEqual(second?.categories, ["cs.LG"]);
  assert.equal(second?.title, "2026");
  assert.equal(second?.pdfUrl, "https://arxiv.org/pdf/2609.05678");
});

test("parseFeed returns [] for an empty feed", () => {
  assert.deepEqual(parseFeed(`<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"></feed>`, "x"), []);
});

test("buildQuery ORs phrases and ANDs categories", () => {
  const topic = { key: "t", title: "T", description: "d", phrases: ["world model", "physical AI"] };
  assert.equal(
    buildQuery(topic, ["cs.CV", "cs.RO"]),
    `(ti:"world model" OR abs:"world model" OR ti:"physical AI" OR abs:"physical AI") AND (cat:cs.CV OR cat:cs.RO)`,
  );
  assert.equal(buildQuery(topic, []), `(ti:"world model" OR abs:"world model" OR ti:"physical AI" OR abs:"physical AI")`);
});

test("parseFeedPage reads totalResults", async () => {
  assert.equal(parseFeedPage(await readFile(fixture, "utf8"), []).totalResults, 2);
  assert.equal(parseFeedPage(`<feed xmlns="http://www.w3.org/2005/Atom"></feed>`, []).totalResults, undefined);
});

test("buildCategoryQuery adds a GMT submittedDate window", () => {
  assert.equal(
    buildCategoryQuery(["cs.CV", "cs.RO"], new Date("2026-09-17T02:17:00Z"), new Date("2026-09-21T02:17:45Z")),
    "(cat:cs.CV OR cat:cs.RO) AND submittedDate:[202609170217 TO 202609210217]",
  );
});

test("matchTopics is case-insensitive over title and abstract", () => {
  const topics = baseConfig.topics;
  assert.deepEqual(matchTopics({ title: "Scaling WORLD MODELS", abstract: "for embodied ai agents" }, topics), ["world-model", "physical-ai"]);
  assert.deepEqual(matchTopics({ title: "A latent dynamics simulator", abstract: "learned from video" }, topics), []);
});

function page(total: number, ids: string[]): string {
  const entries = ids
    .map(
      (id) => `<entry><id>http://arxiv.org/abs/${id}v1</id><updated>2026-09-20T00:00:00Z</updated>
<published>2026-09-20T00:00:00Z</published><title>World model ${id}</title><summary>s</summary>
<author><name>A</name></author><category term="cs.CV"/></entry>`,
    )
    .join("");
  return `<feed xmlns="http://www.w3.org/2005/Atom"><opensearch:totalResults xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">${total}</opensearch:totalResults>${entries}</feed>`;
}

const categoryConfig = {
  ...baseConfig,
  arxiv: { ...baseConfig.arxiv, mode: "category" as const, pageSize: 2, maxPapers: 100, requestDelayMs: 0 },
};

test("category mode pages until the reported total, retrying a spurious empty page", async () => {
  const starts: string[] = [];
  let emptied = false;
  const fetchText = async (url: string): Promise<string> => {
    const start = new URL(url).searchParams.get("start") ?? "";
    starts.push(start);
    if (start === "2" && !emptied) {
      emptied = true;
      return page(5, []); // arXiv hiccup: empty page in the middle of the result set
    }
    const pages: Record<string, string[]> = { "0": ["2609.1", "2609.2"], "2": ["2609.3", "2609.4"], "4": ["2609.5"] };
    return page(5, pages[start] ?? []);
  };
  const papers = await fetchArxiv(categoryConfig, new Date("2026-09-21T02:17:00Z"), fetchText);
  assert.deepEqual(papers.map((p) => p.id), ["2609.1", "2609.2", "2609.3", "2609.4", "2609.5"]);
  assert.deepEqual(starts, ["0", "2", "2", "4"]);
  assert.deepEqual(papers[0]?.matchedTopics, ["world-model"]);
});

test("category mode fails loudly if a page stays empty, instead of silently truncating", async () => {
  const fetchText = async (url: string): Promise<string> =>
    new URL(url).searchParams.get("start") === "0" ? page(5, ["2609.1", "2609.2"]) : page(5, []);
  await assert.rejects(fetchArxiv(categoryConfig, new Date("2026-09-21T02:17:00Z"), fetchText), /empty page at start=2 of 5/);
});

test("category mode stops at maxPapers", async () => {
  const config = { ...categoryConfig, arxiv: { ...categoryConfig.arxiv, maxPapers: 4 } };
  const fetchText = async (url: string): Promise<string> => {
    const start = Number(new URL(url).searchParams.get("start"));
    return page(1000, [`2609.${start}`, `2609.${start + 1}`]);
  };
  const papers = await fetchArxiv(config, new Date("2026-09-21T02:17:00Z"), fetchText);
  assert.equal(papers.length, 4);
});
