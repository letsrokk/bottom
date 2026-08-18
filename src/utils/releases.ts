export type ReleaseRepository = {
  owner: string;
  repo: string;
};

export type GitHubRelease = {
  name: string | null;
  tag_name: string;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
};

export type ReleaseSource = {
  repository: ReleaseRepository;
  releases: GitHubRelease[];
};

export type DisplayRelease = {
  repository: string;
  name: string;
  tag: string;
  url: string;
  publishedAt: string;
};

type StorageAdapter = Pick<Storage, "getItem" | "setItem">;

type ReleaseCache = {
  savedAt: number;
  releases: DisplayRelease[];
};

export const RELEASE_CACHE_KEY = "github-release-cache";
export const RELEASE_CACHE_TTL_MS = 15 * 60 * 1000;

type Fetcher = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

class GitHubResponseError extends Error {
  constructor(readonly status: number) {
    super(`GitHub returned ${status}`);
  }
}

export async function fetchGitHubReleases(
  repositories: ReleaseRepository[],
  fetcher: Fetcher = fetch
): Promise<{
  releases: DisplayRelease[];
  failedCount: number;
  rateLimited: boolean;
}> {
  const results = await Promise.allSettled(
    repositories.map(async repository => {
      const response = await fetcher(
        `https://api.github.com/repos/${repository.owner}/${repository.repo}/releases?per_page=5`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!response.ok) throw new GitHubResponseError(response.status);

      return {
        repository,
        releases: (await response.json()) as GitHubRelease[],
      } satisfies ReleaseSource;
    })
  );

  const sources: ReleaseSource[] = [];
  let failedCount = 0;
  let rateLimited = false;

  for (const result of results) {
    if (result.status === "fulfilled") {
      sources.push(result.value);
      continue;
    }

    failedCount += 1;
    const status =
      result.reason instanceof GitHubResponseError
        ? result.reason.status
        : undefined;
    rateLimited ||= status === 403 || status === 429;
  }

  return {
    releases: aggregateReleases(sources),
    failedCount,
    rateLimited,
  };
}

export function aggregateReleases(
  sources: ReleaseSource[],
  limit = 5
): DisplayRelease[] {
  return sources
    .flatMap(({ repository, releases }) =>
      releases
        .filter(release => !release.prerelease && release.published_at)
        .map(release => ({
          repository: `${repository.owner}/${repository.repo}`,
          name: release.name?.trim() || release.tag_name,
          tag: release.tag_name,
          url: release.html_url,
          publishedAt: release.published_at as string,
        }))
    )
    .sort(
      (left, right) =>
        Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
    )
    .slice(0, limit);
}

export function getReleaseCache(
  storage: Pick<StorageAdapter, "getItem">,
  now = Date.now()
): DisplayRelease[] | null {
  try {
    const raw = storage.getItem(RELEASE_CACHE_KEY);
    if (!raw) return null;

    const cache = JSON.parse(raw) as ReleaseCache;
    if (
      !Number.isFinite(cache.savedAt) ||
      !Array.isArray(cache.releases) ||
      now - cache.savedAt >= RELEASE_CACHE_TTL_MS
    ) {
      return null;
    }

    return cache.releases;
  } catch {
    return null;
  }
}

export function setReleaseCache(
  storage: Pick<StorageAdapter, "setItem">,
  releases: DisplayRelease[],
  now = Date.now()
): void {
  try {
    storage.setItem(
      RELEASE_CACHE_KEY,
      JSON.stringify({ savedAt: now, releases } satisfies ReleaseCache)
    );
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}
