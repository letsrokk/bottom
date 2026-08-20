# GitHub Pages deployment

The site deploys to `https://rokk.club/` from `letsrokk/bottom`.

## Site configuration

The canonical URL is set in `astro-paper.config.ts`. The custom domain is set in
`public/CNAME`. Merge a pull request into `main` to start deployment. Direct
pushes to `main` are blocked by the repository ruleset.

The deployment workflow can also be started manually from `main`. Manual runs
from any other branch skip both the build and deploy jobs.

A scheduled deployment runs daily at 05:17 UTC so the statically rendered
Medium stories refresh without a repository change.

Auto-merge dispatches the deployment after GitHub merges the pull request. The
dispatch must match the current `main` commit before either job can run. An
hourly reconciliation run retries a missing deployment.

## GitHub settings

1. Open **Settings → Pages** in the repository.
2. Set **Source** to **GitHub Actions**.
3. Add the custom domain and verify it in the owning GitHub account.
4. Configure the required DNS records with the DNS provider.
5. Enable **Enforce HTTPS** after GitHub provisions the certificate.
6. Restrict the `github-pages` environment deployment branch to `main`.

The deployment workflow builds for the domain root. It does not configure an Astro `base` path.

## Pull request policy

Pull requests must be current with `main` and pass the `Required checks` status.
Repository branches use squash auto-merge after the pull request leaves draft
state. Fork pull requests require a maintainer to add the `automerge` label;
new fork commits remove that approval.
