import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

let outputDirectory: string;
let homePage: string;
let aboutPage: string;

const linkedinUrl = "https://www.linkedin.com/in/dmitry-mayer-71525477/";

function getHtmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? getHtmlFiles(path)
      : entry.name.endsWith(".html")
        ? [path]
        : [];
  });
}

describe("published pages", () => {
  beforeAll(() => {
    outputDirectory = mkdtempSync(join(tmpdir(), "blog-edit-controls-"));
    execFileSync(
      "node_modules/.bin/astro",
      ["build", "--outDir", outputDirectory],
      {
        stdio: "pipe",
      }
    );
    homePage = readFileSync(join(outputDirectory, "index.html"), "utf8");
    aboutPage = readFileSync(
      join(outputDirectory, "about", "index.html"),
      "utf8"
    );
  }, 60_000);

  afterAll(() => {
    rmSync(outputDirectory, { recursive: true, force: true });
  });

  test("do not show edit controls", () => {
    const pages = getHtmlFiles(outputDirectory).map(path =>
      readFileSync(path, "utf8")
    );

    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      expect(page).not.toContain(">Edit page<");
      expect(page).not.toContain("github.com/letsrokk/bottom/edit/");
    }
  });

  test("shows the concise biography on the home page", () => {
    expect(homePage).toContain(
      "I write about engineering quality, software development, and artificial intelligence through the lens of personal experience."
    );
  });

  test("shows the portrait and privacy-safe biography on the About page", () => {
    expect(aboutPage).toContain('src="/profile.png"');
    expect(aboutPage).toContain('alt="Dmitry Mayer"');
    expect(aboutPage).toContain("I’m originally from Russia");
    expect(aboutPage).toContain("lived and worked across Europe and Asia");
    expect(aboutPage).toContain("more than 15 years");
  });

  test("offers only LinkedIn in the About page contact section", () => {
    const contactSection = aboutPage.match(
      /<section id="contact"[\s\S]*?<\/section>/
    )?.[0];

    expect(contactSection).toBeDefined();
    expect(contactSection?.match(/href=/g)).toHaveLength(1);
    expect(contactSection).toContain(`href="${linkedinUrl}"`);
  });
});
