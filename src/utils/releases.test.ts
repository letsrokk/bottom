import { describe, expect, it } from "vitest";
import {
  aggregateReleases,
  fetchGitHubReleases,
  getReleaseCache,
  RELEASE_CACHE_TTL_MS,
  setReleaseCache,
  type GitHubRelease,
  type ReleaseRepository,
} from "./releases";

const repository: ReleaseRepository = { owner: "example", repo: "app" };

function release(
  tag: string,
  publishedAt: string,
  overrides: Partial<GitHubRelease> = {}
): GitHubRelease {
  return {
    name: null,
    tag_name: tag,
    html_url: `https://github.com/example/app/releases/tag/${tag}`,
    published_at: publishedAt,
    prerelease: false,
    ...overrides,
  };
}

describe("aggregateReleases", () => {
  it("merges repositories, removes prereleases, sorts newest first, and limits results", () => {
    const results = aggregateReleases(
      [
        {
          repository,
          releases: [
            release("v1.0.0", "2026-01-01T00:00:00Z"),
            release("v2.0.0-rc", "2026-06-01T00:00:00Z", {
              prerelease: true,
            }),
          ],
        },
        {
          repository: { owner: "example", repo: "other" },
          releases: [release("v3.0.0", "2026-08-01T00:00:00Z")],
        },
      ],
      1
    );

    expect(results).toEqual([
      expect.objectContaining({ repository: "example/other", tag: "v3.0.0" }),
    ]);
  });

  it("uses the tag when a release has no display name", () => {
    const [result] = aggregateReleases([
      { repository, releases: [release("v1.2.3", "2026-01-01T00:00:00Z")] },
    ]);

    expect(result.name).toBe("v1.2.3");
  });
});

describe("fetchGitHubReleases", () => {
  const repositories = [repository, { owner: "example", repo: "other" }];

  it("keeps successful repositories when another repository fails", async () => {
    const fetcher = async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/other/")) return new Response(null, { status: 404 });
      return Response.json([release("v1.0.0", "2026-01-01T00:00:00Z")]);
    };

    const result = await fetchGitHubReleases(repositories, fetcher);

    expect(result.releases).toHaveLength(1);
    expect(result.failedCount).toBe(1);
    expect(result.rateLimited).toBe(false);
  });

  it("reports rate limits and complete failure without throwing", async () => {
    const fetcher = async () => new Response(null, { status: 403 });

    const result = await fetchGitHubReleases(repositories, fetcher);

    expect(result.releases).toEqual([]);
    expect(result.failedCount).toBe(2);
    expect(result.rateLimited).toBe(true);
  });
});

describe("release cache", () => {
  it("returns a fresh cached value", () => {
    const storage = new Map<string, string>();
    const cache = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    };
    const releases = aggregateReleases([
      { repository, releases: [release("v1.0.0", "2026-01-01T00:00:00Z")] },
    ]);

    setReleaseCache(cache, releases, 1_000);

    expect(getReleaseCache(cache, 1_000 + RELEASE_CACHE_TTL_MS - 1)).toEqual(
      releases
    );
  });

  it("ignores expired or malformed cached values", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    setReleaseCache(storage, [], 1_000);
    expect(getReleaseCache(storage, 1_000 + RELEASE_CACHE_TTL_MS)).toBeNull();

    values.set("github-release-cache", "not-json");
    expect(getReleaseCache(storage, 1_001)).toBeNull();
  });
});
