import { XMLParser } from "fast-xml-parser";
import { SyntaxValidator } from "fast-xml-validator";

export type MediumPost = {
  title: string;
  url: string;
  publishedAt: string;
  excerpt: string;
};

type RawMediumItem = {
  title?: unknown;
  link?: unknown;
  pubDate?: unknown;
  "content:encoded"?: unknown;
};

type RawMediumFeed = {
  rss?: {
    channel?: {
      item?: RawMediumItem | RawMediumItem[];
    };
  };
};

type Fetcher = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  trimValues: true,
});

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const namedEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== "#") return namedEntities[code.toLowerCase()] ?? entity;

    const numeric = code[1].toLowerCase() === "x";
    const point = Number.parseInt(
      code.slice(numeric ? 2 : 1),
      numeric ? 16 : 10
    );
    try {
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    } catch {
      return entity;
    }
  });
}

function createExcerpt(html: string): string {
  const plainText = decodeHtmlEntities(
    html
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();

  const characters = [...plainText];
  return characters.length > 180
    ? `${characters.slice(0, 179).join("").trimEnd()}…`
    : plainText;
}

export function parseMediumFeed(xml: string, limit = 3): MediumPost[] {
  SyntaxValidator.validate(xml);

  const parsed = parser.parse(xml) as RawMediumFeed;
  const rawItems = parsed.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return items
    .map(item => ({
      title: asString(item.title),
      url: asString(item.link),
      publishedAt: asString(item.pubDate),
      excerpt: createExcerpt(asString(item["content:encoded"])),
    }))
    .filter(
      story =>
        story.title &&
        story.url &&
        story.publishedAt &&
        Number.isFinite(Date.parse(story.publishedAt))
    )
    .sort(
      (left, right) =>
        Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
    )
    .slice(0, Math.max(0, limit));
}

export async function fetchMediumPosts(
  feedUrl: string,
  limit = 3,
  fetcher: Fetcher = fetch
): Promise<MediumPost[]> {
  try {
    const response = await fetcher(feedUrl, {
      headers: { Accept: "application/rss+xml, application/xml;q=0.9" },
    });
    if (!response.ok) {
      throw new Error(`Medium returned ${response.status}`);
    }

    return parseMediumFeed(await response.text(), limit);
  } catch (error) {
    // eslint-disable-next-line no-console -- Surface build-time feed failures without breaking deployment.
    console.warn(
      "Medium stories could not be loaded during the build.",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}
