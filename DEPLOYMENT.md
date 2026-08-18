# GitHub Pages deployment

The site deploys to `https://rokk.club/` from `letsrokk/bottom`.

## Site configuration

The canonical URL is set in `astro-paper.config.ts`. The custom domain is set in
`public/CNAME`. Push changes to the `main` branch to start deployment.

## GitHub settings

1. Open **Settings → Pages** in the repository.
2. Set **Source** to **GitHub Actions**.
3. Add the custom domain and verify it in the owning GitHub account.
4. Configure the required DNS records with the DNS provider.
5. Enable **Enforce HTTPS** after GitHub provisions the certificate.

The deployment workflow builds for the domain root. It does not configure an Astro `base` path.
