import type { Paper } from "../types.ts";
import { collapseWhitespace } from "../util.ts";
import { fetchWithRetry, type FetchText } from "./arxiv.ts";

/** What the arXiv HTML rendering (LaTeXML) of a paper tells us beyond the API feed. */
export interface HtmlMeta {
  /** Author affiliations, deduped, in author order. Empty when the page has none or does not exist. */
  affiliations: string[];
  /** First figure of the paper, absolute URL. */
  imageUrl?: string;
  /** github.com / huggingface.co links found anywhere on the page. */
  links: string[];
}

const HTML_BASE = "https://arxiv.org/html/";
const NOISE = /github\.com\/(arXiv|brucemiller)\//i;

/** Some papers' affiliation fields render as "[" or "1": a real one has a few letters. */
const plausible = (text: string): boolean => (text.match(/\p{L}/gu)?.length ?? 0) >= 3 && !text.includes("@");
const decode = (text: string): string => text.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
const stripTags = (html: string): string => collapseWhitespace(decode(html.replace(/<[^>]+>/g, " ")));

export function parseArxivHtml(html: string): HtmlMeta {
  const affiliations = new Set<string>();
  // LaTeXML marks explicit \affiliation as ltx_role_affiliation ...
  for (const m of html.matchAll(/ltx_role_affiliation">(?:<span class="ltx_contact_name">[^<]*<\/span>)?([^<]+)/g)) {
    const text = collapseWhitespace(decode(m[1] as string).replace(/[;,.\s]+$/, ""));
    if (plausible(text)) affiliations.add(text);
  }
  // ... but most papers just put it after a line break inside the author name.
  if (affiliations.size === 0) {
    for (const m of html.matchAll(/<span class="ltx_personname">([\s\S]*?)<\/span>/g)) {
      const [, ...rest] = (m[1] as string).split(/<br[^>]*>/);
      for (const part of rest) {
        const text = stripTags(part).replace(/^[\d,*†‡§\s]+/, "").replace(/[;,.\s]+$/, "");
        if (plausible(text)) affiliations.add(text);
      }
    }
  }

  const figure = html.indexOf("<figure");
  const src = figure >= 0 ? /<img[^>]+src="([^"]+)"/.exec(html.slice(figure))?.[1] : undefined;
  const imageUrl = src ? (/^https?:/.test(src) ? src : HTML_BASE + src.replace(/^\.?\//, "")) : undefined;

  const links = new Set<string>();
  for (const m of html.matchAll(/https?:\/\/(?:www\.)?(?:github\.com|huggingface\.co)\/[\w.-]+\/[\w.-]+/g)) {
    const url = m[0].replace(/[.,;:)]+$/, "");
    if (!NOISE.test(url)) links.add(url);
  }
  return { affiliations: [...affiliations].slice(0, 8), ...(imageUrl ? { imageUrl } : {}), links: [...links] };
}

/** One GET per paper. A paper without an HTML rendering (or any fetch failure) yields an empty meta. */
export async function fetchArxivHtml(paper: Paper, fetchText: FetchText = fetchWithRetry): Promise<HtmlMeta> {
  try {
    return parseArxivHtml(await fetchText(`${HTML_BASE}${paper.id}v${paper.version}`));
  } catch (error) {
    console.warn(`[arxiv-html] ${paper.id}: ${error instanceof Error ? error.message : error}`);
    return { affiliations: [], links: [] };
  }
}
