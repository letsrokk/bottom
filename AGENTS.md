# Project

`https://rokk.club/` is a Markdown-first personal technology blog based on
AstroPaper: a static Astro 7 GitHub Pages site using strict TypeScript, Astro
components, Tailwind CSS 4, MD/MDX collections, Pagefind, and Vitest.

Match CI and deployment with Node.js 24 and pnpm 11.19. The manifest allows
Node.js 22.12+, but changes must pass on 24. Use pnpm; change `pnpm-lock.yaml`
only for intentional dependency changes.

## Commands

Install dependencies with `pnpm install --frozen-lockfile`.

- `pnpm test`: run all colocated Vitest tests once.
- `pnpm lint:content`: validate Markdown/MDX structure, local resources, and
  heading links without probing remote URLs.
- `pnpm format:check` / `pnpm format`: check/apply Prettier formatting.
- `pnpm lint`: lint TypeScript and Astro with ESLint.
- `pnpm build`: run `astro check`, build, create the Pagefind index, and copy it
  to `public/pagefind/`.
- `pnpm preview`: serve the production build.
- Always start the dev server with `pnpm astro dev --background`; manage it with
  `pnpm astro dev status`, `pnpm astro dev logs`, and `pnpm astro dev stop`.
  Never leave a foreground server running in a task.

Before handoff or a pull request, run checks by change type:

- Functional: focused tests, then `pnpm test`, `pnpm format:check`, `pnpm lint`,
  and `pnpm build`.
- Content only: no Vitest edits or run; run `pnpm lint:content`,
  `pnpm format:check`, and `pnpm build`.
- Mixed functional/content: run both sets.

`dist/`, `.astro/`, `coverage/`, and `public/pagefind/` are generated and
ignored. Do not commit them.

## Repository map

- Configuration: `astro-paper.config.ts` owns canonical URL, identity,
  pagination, features, social/share links; `astro.config.ts` owns integrations,
  Markdown, syntax highlighting, Tailwind, i18n, environment fields, and SVG
  optimization; `src/content.config.ts` defines `posts`/`pages` schemas. `@/*`
  resolves to `src/*`.
- Content/data: `src/content/posts/` contains Markdown/MDX posts; `_`
  directories hold supporting assets or upstream references;
  `src/content/pages/` contains content-backed pages; `src/data/site-data.ts`
  contains biography, application statuses, and public GitHub repositories.
- Application: `src/pages/` provides file routes, with dynamic post/tag routes
  under `[...slug]` and `[...page]`; `src/components/`, `src/layouts/`, and
  `src/styles/` contain Astro UI, page shells, and global/theme/typography CSS.
  Keep client scripts small and framework-free unless another integration is
  explicitly required.
- Tests/automation: `src/**/*.test.ts` contains colocated Vitest tests;
  `.github/scripts/classify-changes.sh` selects conditional CI jobs;
  `.github/workflows/` contains CI, auto-merge, reconciliation, and Pages
  deployment; `DEPLOYMENT.md` covers custom-domain and repository settings.

## Content conventions

Posts are `.md`/`.mdx` in `src/content/posts/`. Required: `pubDatetime`, `title`,
`description`. Defaults: `author`, `tags`. Optional:
`modDatetime`, `featured`, `draft`, `ogImage`, `canonicalURL`, `hideEditPost`,
`timezone`. Keep post-only images beside the post; use relative links for
content-linter validation.

Put site-wide identity/features in `astro-paper.config.ts` and profile/widget
data in `src/data/site-data.ts`; never duplicate them in an Astro component.

Formatting: authoritative Prettier with Astro/Tailwind plugins. ESLint rejects
`console`; use strict types and existing two-space, double-quote TypeScript.

## Test coverage

- Add/update tests only when a deterministic seam protects meaningful,
  observable project-owned behavior, a reproducible regression, a public
  contract, or a material security/CI boundary.
- Do not test behavior owned by Astro, AstroPaper, Tailwind, Remark, Pagefind,
  Vitest, GitHub Actions, or other dependencies. Rely on upstream suites and
  our build/type/lint checks. Test an integration only when our adapter,
  documented workaround, or material boundary can regress independently.
- Do not test mutable content, static metadata, or configuration literals that
  only record current state. Do not duplicate formatting, content linting,
  type-checking, or builds in Vitest.
- Prefer the smallest stable seam. Do not restructure production code only to
  test dependency behavior or trivial configuration. Do not run Astro builds
  in Vitest unless they uniquely verify important output beyond `pnpm build`.
- Behavior-preserving refactors use existing tests; add none. Update
  `src/ci-paths.test.ts` for CI path rules and
  `src/workflow-security.test.ts` for workflow security.

## GitHub workflow

All `main` changes use pull requests; direct pushes are blocked. Classified site
changes run site checks; content changes also run the content linter. `Required
checks` is the branch-protection gate.

Non-draft repository-branch pull requests squash-auto-merge after required
checks pass. Fork pull requests require a maintainer to re-add `automerge` after
each new commit. Merges dispatch Pages for the exact current `main` commit; an
hourly workflow retries missing deployments. Preserve these trust boundaries.

Deploy `main` at the domain root. `astro-paper.config.ts` holds the canonical
URL; `public/CNAME` holds the custom domain. Do not add an Astro `base` path.

Use current Astro framework behavior from `https://docs.astro.build/`. Before
changing routing, components, content collections, styling, or i18n, check its
applicable guide.
