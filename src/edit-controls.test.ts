import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

let outputDirectory: string;

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
});
