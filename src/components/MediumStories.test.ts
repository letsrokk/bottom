import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import MediumStories from "./MediumStories.astro";

const profileUrl = "https://letsrokk.medium.com";

describe("MediumStories", () => {
  it("renders story details and keeps the profile link beside the heading", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MediumStories, {
      props: {
        profileUrl,
        stories: [
          {
            title: "A Medium story",
            url: "https://medium.com/@letsrokk/a-story",
            publishedAt: "2026-08-20T08:00:00.000Z",
            excerpt: "A concise story excerpt.",
          },
        ],
      },
    });

    expect(html).toContain("Latest stories");
    expect(html).toContain(`href="${profileUrl}"`);
    expect(html).toContain("More on Medium");
    expect(html).toContain("A Medium story");
    expect(html).toContain("A concise story excerpt.");
    expect(html).not.toContain("data-medium-empty-state");
  });

  it("renders the tumbleweed empty state while retaining the profile link", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MediumStories, {
      props: { profileUrl, stories: [] },
    });

    expect(html).toContain(`href="${profileUrl}"`);
    expect(html).toContain("data-medium-empty-state");
    expect(html).toContain("data-tumbleweed-icon");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("These are not the stories you're looking for");
  });
});
