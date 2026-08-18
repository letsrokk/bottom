import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const deployWorkflow = readFileSync(".github/workflows/deploy.yml", "utf8");
const workflowFiles = [
  ".github/workflows/ci.yml",
  ".github/workflows/deploy.yml",
];

describe("GitHub Actions security", () => {
  test("pins every action to a full commit SHA", () => {
    for (const path of workflowFiles) {
      const workflow = readFileSync(path, "utf8");
      const actionReferences = [
        ...workflow.matchAll(/^\s*uses:\s*([^\s#]+)/gm),
      ];

      expect(
        actionReferences.length,
        `${path} has no action references`
      ).toBeGreaterThan(0);
      for (const [, reference] of actionReferences) {
        expect(reference, `${path}: ${reference}`).toMatch(
          /^[^@\s]+@[0-9a-f]{40}$/
        );
      }
    }
  });

  test("grants deployment permissions only to the deploy job", () => {
    expect(deployWorkflow).not.toMatch(/^permissions:\s*\n(?:^[ \t]+.*\n?)+/m);
    expect(deployWorkflow).toMatch(
      /build:\s*\n(?:^[ \t]+.*\n)*?[ \t]+permissions:\s*\n[ \t]+contents:\s*read/m
    );
    expect(deployWorkflow).toMatch(
      /deploy:\s*\n(?:^[ \t]+.*\n)*?[ \t]+permissions:\s*\n[ \t]+pages:\s*write\s*\n[ \t]+id-token:\s*write/m
    );
  });
});
