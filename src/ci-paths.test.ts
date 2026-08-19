import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function classify(paths: string[]) {
  const directory = mkdtempSync(join(tmpdir(), "blog-ci-paths-"));
  temporaryDirectories.push(directory);
  const output = join(directory, "output");
  const result = spawnSync("bash", [".github/scripts/classify-changes.sh"], {
    encoding: "utf8",
    env: { ...process.env, GITHUB_OUTPUT: output },
    input: `${paths.join("\0")}\0`,
  });

  expect(result.status, result.stderr).toBe(0);

  return Object.fromEntries(
    readFileSync(output, "utf8")
      .trim()
      .split("\n")
      .map(line => line.split("="))
  );
}

describe("CI path classification", () => {
  test("skips heavy jobs for documentation-only changes", () => {
    expect(classify(["README.md", "DEPLOYMENT.md"])).toEqual({
      site: "false",
      content: "false",
    });
  });

  test("runs site checks for application changes", () => {
    expect(classify(["src/components/Header.astro"])).toEqual({
      site: "true",
      content: "false",
    });
  });

  test("runs site and content checks for nested posts", () => {
    expect(classify(["src/content/posts/releases/new-post.mdx"])).toEqual({
      site: "true",
      content: "true",
    });
  });
});
