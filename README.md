# Personal technology blog

A Markdown-first personal blog built with Astro and the open-source AstroPaper theme. It includes a full-width biography, recent posts, placeholder application statuses, public GitHub releases, and persistent system, light, and dark themes.

## Local development

Requirements: Node.js 24 and pnpm 11.

```sh
pnpm install
pnpm dev
```

Run the project checks before publishing:

```sh
pnpm test
pnpm format:check
pnpm lint
pnpm build
```

## Customize

- Identity, social profiles, and site URL: `astro-paper.config.ts`
- Biography, apps, statuses, and GitHub repositories: `src/data/site-data.ts`
- Markdown posts: `src/content/posts/`
- Custom domain and Pages setup: `DEPLOYMENT.md`

The placeholder GitHub repositories are intentionally invalid. Replace them before deployment so the release widget can load public releases.

## Credits

Based on [AstroPaper](https://github.com/satnaing/astro-paper), licensed under the MIT License.
