---
title: "Hello, World: My First Blog Post"
pubDatetime: 2026-08-18T12:00:00+02:00
description: "Why I started this blog and how its first Astro deployment reached GitHub Pages."
tags:
  - personal
  - astro
  - github-pages
draft: false
---

Every new project starts with a first deployment. This post marks mine for this blog.

I created this site as a place to document experiences from my professional work. The subjects will include information technology, artificial intelligence, quality assurance, and software development. More importantly, I want to write about the practical connections between those subjects: what worked, what failed, and what I learned along the way.

## Why Astro and AstroPaper

I wanted the site to stay small. Articles live in Markdown, the published output is static, and there is no database or content management system to maintain.

[Astro](https://astro.build/) provides the structure and room for custom components. [AstroPaper](https://github.com/satnaing/astro-paper) provides an accessible starting point with sensible typography, search, RSS, and light and dark themes.

That combination keeps writing simple while leaving enough flexibility for project status and GitHub release widgets on the homepage.

## The first deployment

GitHub Actions builds the site whenever a change reaches the main branch. GitHub Pages then serves the generated static files through the configured custom domain.

The workflow is intentionally short:

1. Write or edit a Markdown post.
2. Preview the site locally.
3. Push the change to GitHub.
4. Let the deployment workflow publish it.

This first version is only a foundation. The useful part begins with the next post.
