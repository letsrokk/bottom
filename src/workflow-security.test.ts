import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, test } from "vitest";

const ciWorkflow = readFileSync(".github/workflows/ci.yml", "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy.yml", "utf8");
const autoMergeWorkflowPath = ".github/workflows/auto-merge.yml";
const autoMergeWorkflow = existsSync(autoMergeWorkflowPath)
  ? readFileSync(autoMergeWorkflowPath, "utf8")
  : "";
const autoMergeWatcherPath = ".github/workflows/auto-merge-watcher.yml";
const autoMergeWatcher = existsSync(autoMergeWatcherPath)
  ? readFileSync(autoMergeWatcherPath, "utf8")
  : "";
const workflowFiles = readdirSync(".github/workflows")
  .filter(path => path.endsWith(".yml") || path.endsWith(".yaml"))
  .map(path => `.github/workflows/${path}`);

describe("GitHub Actions security", () => {
  test("pins every action to a full commit SHA", () => {
    for (const path of workflowFiles) {
      const workflow = readFileSync(path, "utf8");
      const actionReferences = [
        ...workflow.matchAll(/^\s*uses:\s*([^\s#]+)/gm),
      ];

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

  test("runs conditional pull request checks behind one required check", () => {
    expect(ciWorkflow).toMatch(/pull_request:\s*\n\s+branches:\s*\[main\]/);
    expect(ciWorkflow).not.toMatch(/^\s+paths(?:-ignore)?:/m);
    expect(ciWorkflow).toMatch(/name:\s*Required checks/);
    expect(ciWorkflow).toMatch(/if:\s*\$\{\{ always\(\) \}\}/);
    expect(ciWorkflow).toContain("pnpm run test");
    expect(ciWorkflow).toContain("pnpm run lint:content");
  });

  test("limits automatic merge to trusted non-draft pull requests", () => {
    expect(autoMergeWorkflow).toContain("pull_request_target:");
    expect(autoMergeWorkflow).not.toContain("actions/checkout");
    expect(autoMergeWorkflow).toMatch(
      /permissions:\s*\n\s+contents:\s*write\s*\n\s+pull-requests:\s*write/
    );
    expect(autoMergeWorkflow).toContain("pull_request.draft == false");
    expect(autoMergeWorkflow).toContain("pull_request.head.repo.full_name");
    expect(autoMergeWorkflow).toContain("automerge");
    expect(autoMergeWorkflow).toContain("gh pr merge --auto --squash");
    expect(autoMergeWorkflow).toContain('--match-head-commit "$HEAD_SHA"');
    expect(autoMergeWorkflow).toContain("watch-auto-merge");
    expect(autoMergeWorkflow).not.toContain("|| true");
    expect(autoMergeWorkflow).not.toContain("--admin");
  });

  test("watches native auto-merge before dispatching deployment", () => {
    expect(autoMergeWatcher).toContain("repository_dispatch:");
    expect(autoMergeWatcher).toContain("watch-auto-merge");
    expect(autoMergeWatcher).toContain("timeout-minutes: 360");
    expect(autoMergeWatcher).toContain(
      "${{ github.event.client_payload.head_sha }}"
    );
    expect(autoMergeWatcher).toContain("sleep 30");
    expect(autoMergeWatcher).toContain("pulls/$PR_NUMBER");
    expect(autoMergeWatcher).toContain(".head.sha");
    expect(autoMergeWatcher).toContain("gh workflow run deploy.yml");
    expect(autoMergeWatcher).toContain("--force-with-lease");
    expect(autoMergeWatcher).not.toContain("--admin");
  });

  test("guards every Pages job to the main branch", () => {
    expect(deployWorkflow).toMatch(/push:\s*\n\s+branches:\s*\[main\]/);
    expect(deployWorkflow).toContain("workflow_dispatch:");
    expect(deployWorkflow).toContain("expected_sha:");
    expect(deployWorkflow).toContain(
      "inputs.expected_sha == '' || inputs.expected_sha == github.sha"
    );
    expect(
      deployWorkflow.match(/github\.ref == 'refs\/heads\/main'/g)
    ).toHaveLength(2);
  });

  test("rebuilds the Pages site daily for external feed updates", () => {
    expect(deployWorkflow).toMatch(
      /schedule:\s*\n\s+- cron: ["']17 5 \* \* \*["']/
    );
  });
});
