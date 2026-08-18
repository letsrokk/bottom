# GitHub Pages deployment

Replace all placeholder values before the first public deployment.

## Site configuration

1. Set `site.url` in `astro-paper.config.ts` to the final HTTPS domain.
2. Replace `public/CNAME` with that domain only, without a protocol or path.
3. Replace the profile and repository placeholders in `astro-paper.config.ts` and `src/data/site-data.ts`.
4. Push the project to the `main` branch of a public GitHub repository.

## GitHub settings

1. Open **Settings → Pages** in the repository.
2. Set **Source** to **GitHub Actions**.
3. Add the custom domain and verify it in the owning GitHub account.
4. Configure the required DNS records with the DNS provider.
5. Enable **Enforce HTTPS** after GitHub provisions the certificate.

The deployment workflow builds for the domain root. It does not configure an Astro `base` path.
