import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchArtifacts, readmeImage } from "../src/sources/artifacts.ts";
import type { Paper } from "../src/types.ts";

const paper = (abstract: string): Paper => ({ id: "2609.21045", abstract } as Paper);

function fakeFetch(routes: Record<string, unknown>, seen: string[] = []): typeof fetch {
  return (async (url: unknown) => {
    seen.push(String(url));
    const hit = routes[String(url)];
    return hit === undefined ? new Response("nope", { status: 404 }) : new Response(JSON.stringify(hit), { status: 200 });
  }) as typeof fetch;
}

test("fetchArtifacts: GitHub licence + README image, Hugging Face weights + licence tag", async () => {
  const readme = Buffer.from("# Repo\n\n![teaser](./assets/teaser.png)\n").toString("base64");
  const seen: string[] = [];
  const fetchImpl = fakeFetch(
    {
      "https://api.github.com/repos/ut-austin-rpl/dextera": { html_url: "https://github.com/ut-austin-rpl/dextera", license: { spdx_id: "MIT" } },
      "https://api.github.com/repos/ut-austin-rpl/dextera/readme": { content: readme },
      "https://huggingface.co/api/arxiv/2609.21045/repos": { models: [{ id: "ut-austin-rpl/dextera-policy", tags: ["robotics", "license:cc-by-nc-4.0"] }] },
    },
    seen,
  );
  const out = await fetchArtifacts(paper("Code: https://github.com/ut-austin-rpl/dextera."), [], { fetchImpl });
  assert.deepEqual(out, {
    code: { url: "https://github.com/ut-austin-rpl/dextera", license: "MIT" },
    imageUrl: "https://raw.githubusercontent.com/ut-austin-rpl/dextera/HEAD/assets/teaser.png",
    weights: { url: "https://huggingface.co/ut-austin-rpl/dextera-policy", license: "cc-by-nc-4.0" },
  });
  assert.equal(seen.length, 3);
});

test("fetchArtifacts: nothing linked, repo 404, no licence declared", async () => {
  assert.deepEqual(await fetchArtifacts(paper("No links here."), [], { fetchImpl: fakeFetch({}) }), {});
  const fetchImpl = fakeFetch({
    "https://api.github.com/repos/o/r": { html_url: "https://github.com/o/r", license: { spdx_id: "NOASSERTION" } },
    "https://huggingface.co/api/arxiv/2609.21045/repos": { models: [] },
    "https://huggingface.co/api/models/o/m": { tags: [] },
  });
  const out = await fetchArtifacts(paper("x"), ["https://github.com/o/r", "https://huggingface.co/o/m"], { fetchImpl });
  assert.deepEqual(out, { code: { url: "https://github.com/o/r" }, weights: { url: "https://huggingface.co/o/m" } });
});

test("readmeImage: markdown or html, relative or absolute", () => {
  assert.equal(readmeImage('<p align="center"><img src="docs/fig.png" width="80%"></p>', "o", "r"), "https://raw.githubusercontent.com/o/r/HEAD/docs/fig.png");
  assert.equal(readmeImage("![x](https://cdn.example.com/a.gif)", "o", "r"), "https://cdn.example.com/a.gif");
  assert.equal(readmeImage("no images", "o", "r"), undefined);
  assert.equal(readmeImage("[![ci](https://img.shields.io/badge/x.svg)](y) ![logo](logo.svg)\n![teaser](docs/t.png)", "o", "r"), "https://raw.githubusercontent.com/o/r/HEAD/docs/t.png", "badges and svg logos are skipped");
});
