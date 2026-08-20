import { describe, expect, it, vi } from "vitest";
import { fetchMediumPosts, parseMediumFeed } from "./medium";

function item({
  title,
  link,
  publishedAt,
  content = "<p>Story excerpt.</p>",
}: {
  title: string;
  link: string;
  publishedAt: string;
  content?: string;
}) {
  return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <pubDate>${publishedAt}</pubDate>
      <content:encoded><![CDATA[${content}]]></content:encoded>
    </item>`;
}

function feed(items: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
      <channel>${items}</channel>
    </rss>`;
}

describe("parseMediumFeed", () => {
  it("sorts stories newest first and applies the requested limit", () => {
    const xml = feed(
      [
        item({
          title: "Second",
          link: "https://medium.com/@letsrokk/second",
          publishedAt: "Tue, 18 Aug 2026 08:00:00 GMT",
        }),
        item({
          title: "Newest",
          link: "https://medium.com/@letsrokk/newest",
          publishedAt: "Thu, 20 Aug 2026 08:00:00 GMT",
        }),
        item({
          title: "Oldest",
          link: "https://medium.com/@letsrokk/oldest",
          publishedAt: "Mon, 17 Aug 2026 08:00:00 GMT",
        }),
        item({
          title: "Third",
          link: "https://medium.com/@letsrokk/third",
          publishedAt: "Wed, 19 Aug 2026 08:00:00 GMT",
        }),
      ].join("")
    );

    expect(parseMediumFeed(xml, 3).map(story => story.title)).toEqual([
      "Newest",
      "Third",
      "Second",
    ]);
  });

  it("turns story HTML into a normalized plain-text excerpt", () => {
    const xml = feed(
      item({
        title: "Markup",
        link: "https://medium.com/@letsrokk/markup",
        publishedAt: "Thu, 20 Aug 2026 08:00:00 GMT",
        content:
          "<p>Hello <strong>Medium</strong> &amp; friends.&nbsp; &#39;Quoted&#39;.</p><p>Second paragraph.</p>",
      })
    );

    expect(parseMediumFeed(xml)[0]?.excerpt).toBe(
      "Hello Medium & friends. 'Quoted'. Second paragraph."
    );
  });

  it("caps long excerpts at 180 characters", () => {
    const xml = feed(
      item({
        title: "Long",
        link: "https://medium.com/@letsrokk/long",
        publishedAt: "Thu, 20 Aug 2026 08:00:00 GMT",
        content: `<p>${"a".repeat(181)}</p>`,
      })
    );

    expect(parseMediumFeed(xml)[0]?.excerpt).toBe(`${"a".repeat(179)}…`);
  });

  it("normalizes a feed containing one story", () => {
    const xml = feed(
      item({
        title: "Only story",
        link: "https://medium.com/@letsrokk/only",
        publishedAt: "Thu, 20 Aug 2026 08:00:00 GMT",
      })
    );

    expect(parseMediumFeed(xml)).toEqual([
      {
        title: "Only story",
        url: "https://medium.com/@letsrokk/only",
        publishedAt: "Thu, 20 Aug 2026 08:00:00 GMT",
        excerpt: "Story excerpt.",
      },
    ]);
  });

  it("discards stories without a title, link, or valid publication date", () => {
    const xml = feed(`
      ${item({
        title: "Valid",
        link: "https://medium.com/@letsrokk/valid",
        publishedAt: "Thu, 20 Aug 2026 08:00:00 GMT",
      })}
      ${item({
        title: "Missing link",
        link: "",
        publishedAt: "Thu, 20 Aug 2026 08:00:00 GMT",
      })}
      ${item({
        title: "Bad date",
        link: "https://medium.com/@letsrokk/bad-date",
        publishedAt: "not-a-date",
      })}
    `);

    expect(parseMediumFeed(xml).map(story => story.title)).toEqual(["Valid"]);
  });

  it("returns an empty list for a valid feed without stories", () => {
    expect(parseMediumFeed(feed(""))).toEqual([]);
  });
});

describe("fetchMediumPosts", () => {
  it("fetches and parses the requested Medium feed", async () => {
    const xml = feed(
      item({
        title: "Fetched story",
        link: "https://medium.com/@letsrokk/fetched",
        publishedAt: "Thu, 20 Aug 2026 08:00:00 GMT",
      })
    );
    const fetcher = async () => new Response(xml, { status: 200 });

    await expect(
      fetchMediumPosts("https://letsrokk.medium.com/feed", 3, fetcher)
    ).resolves.toEqual([
      expect.objectContaining({
        title: "Fetched story",
        url: "https://medium.com/@letsrokk/fetched",
      }),
    ]);
  });

  it.each([
    ["a network failure", async () => Promise.reject(new Error("offline"))],
    ["a non-success response", async () => new Response(null, { status: 503 })],
    [
      "malformed XML",
      async () => new Response("<rss><channel><item></rss>", { status: 200 }),
    ],
  ])("returns an empty list after %s", async (_case, fetcher) => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      fetchMediumPosts("https://letsrokk.medium.com/feed", 3, fetcher)
    ).resolves.toEqual([]);
    expect(warning).toHaveBeenCalledOnce();

    warning.mockRestore();
  });
});
