#!/usr/bin/env bash

set -euo pipefail

: "${GITHUB_OUTPUT:?GITHUB_OUTPUT must identify the Actions output file}"

site=false
content=false

while IFS= read -r -d '' file; do
  case "$file" in
    src/* | public/* | astro.config.ts | astro-paper.config.ts | package.json | pnpm-lock.yaml | pnpm-workspace.yaml | tsconfig.json | eslint.config.js | .prettierrc | .prettierignore | .remarkrc.mjs | .github/workflows/*.yml | .github/workflows/*.yaml | .github/scripts/*)
      site=true
      ;;
  esac

  case "$file" in
    src/content/*.md | src/content/*.mdx | .remarkrc.mjs | package.json | pnpm-lock.yaml | .github/workflows/ci.yml | .github/scripts/classify-changes.sh)
      content=true
      ;;
  esac
done

{
  echo "site=$site"
  echo "content=$content"
} >> "$GITHUB_OUTPUT"
