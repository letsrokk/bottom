import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("content lint", () => {
  test("accepts the published content", () => {
    expect(() =>
      execFileSync("pnpm", ["run", "lint:content"], { stdio: "pipe" })
    ).not.toThrow();
  });

  test("reports missing local resources and headings", () => {
    const directory = mkdtempSync(join(process.cwd(), ".content-lint-test-"));
    temporaryDirectories.push(directory);
    const fixture = join(directory, "broken.md");
    writeFileSync(
      fixture,
      [
        "---",
        'title: "Broken links"',
        "---",
        "",
        "## Existing heading",
        "",
        "[Missing heading](#missing-heading)",
        "",
        "![Missing image](missing-image.png)",
        "",
      ].join("\n")
    );

    const result = spawnSync(
      "node_modules/.bin/remark",
      ["--frail", "--rc-path", ".remarkrc.mjs", fixture],
      { encoding: "utf8" }
    );
    const output = `${result.stdout}\n${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("Cannot find heading");
    expect(output).toContain("Cannot find file");
  });

  test("does not probe remote URLs", () => {
    const directory = mkdtempSync(join(process.cwd(), ".content-lint-test-"));
    temporaryDirectories.push(directory);
    const fixture = join(directory, "remote-link.md");
    writeFileSync(
      fixture,
      [
        "---",
        'title: "Remote link"',
        "---",
        "",
        "[Unreachable example](https://invalid.example.test/resource)",
        "",
      ].join("\n")
    );

    const result = spawnSync(
      "node_modules/.bin/remark",
      ["--frail", "--rc-path", ".remarkrc.mjs", fixture],
      { encoding: "utf8" }
    );

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  });
});
