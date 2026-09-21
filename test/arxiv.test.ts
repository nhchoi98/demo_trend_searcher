import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { buildQuery, parseFeed } from "../src/sources/arxiv.ts";

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
  const topic = { key: "t", title: "T", phrases: ["world model", "physical AI"] };
  assert.equal(
    buildQuery(topic, ["cs.CV", "cs.RO"]),
    `(ti:"world model" OR abs:"world model" OR ti:"physical AI" OR abs:"physical AI") AND (cat:cs.CV OR cat:cs.RO)`,
  );
  assert.equal(buildQuery(topic, []), `(ti:"world model" OR abs:"world model" OR ti:"physical AI" OR abs:"physical AI")`);
});
