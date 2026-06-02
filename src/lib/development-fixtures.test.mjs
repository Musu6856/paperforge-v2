import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  clearDevelopmentProjectStoreForTests,
  getDevelopmentProject,
} from "./development-project-store.ts";
import {
  createImplicitSystemFixtureProject,
  IMPLICIT_SYSTEM_FIXTURE_PROJECT_ID,
  createSimpleEquilibriumFixtureProject,
  seedImplicitSystemDevelopmentFixture,
  seedSimpleEquilibriumDevelopmentFixture,
  SIMPLE_EQUILIBRIUM_FIXTURE_PROJECT_ID,
} from "./development-fixtures.ts";

test("simple-equilibrium fixture creates a browser-smoke-ready solved analysis project", () => {
  const project = createSimpleEquilibriumFixtureProject(1710000400000);
  const run = project.researchSession?.agentRuns?.at(-1);

  assert.equal(project.id, SIMPLE_EQUILIBRIUM_FIXTURE_PROJECT_ID);
  assert.equal(project.researchSession?.phase, "analysis");
  assert.equal(project.equilibriumResult?.status, "solved");
  assert.match(project.equilibriumResult?.closedForm ?? "", /\\tau_A\^\*/);
  assert.equal(project.propertyAnalyses?.length, 3);
  assert.equal(run?.workflowId, "paperforge-research-workflow");
  assert.equal(run?.action, "analyze_properties");
  assert.equal(run?.steps.length, 3);
  assert.match(
    run?.steps
      .flatMap((step) => step.details ?? [])
      .map((detail) => detail.value)
      .join("\n") ?? "",
    /simple_equilibrium_fixture|solved|analysis/
  );
});

test("simple-equilibrium fixture seeds the local development project store", () => {
  withTempDevelopmentProjectStore(() => {
    clearDevelopmentProjectStoreForTests();

    const seeded = seedSimpleEquilibriumDevelopmentFixture(
      "owner-a",
      1710000400000
    );
    const stored = getDevelopmentProject("owner-a", seeded.id);

    assert.equal(seeded.id, SIMPLE_EQUILIBRIUM_FIXTURE_PROJECT_ID);
    assert.equal(stored?.equilibriumResult?.status, "solved");
    assert.equal(stored?.researchSession?.phase, "analysis");
    assert.equal(
      stored?.researchSession?.agentRuns?.at(-1)?.action,
      "analyze_properties"
    );
  });
});

test("implicit-system fixture creates a browser-smoke-ready analysis project", () => {
  const project = createImplicitSystemFixtureProject(1710000300000);
  const run = project.researchSession?.agentRuns?.at(-1);

  assert.equal(project.id, IMPLICIT_SYSTEM_FIXTURE_PROJECT_ID);
  assert.equal(project.researchSession?.phase, "analysis");
  assert.equal(project.equilibriumResult?.status, "implicit_system");
  assert.ok(project.equilibriumResult?.derivation.includes("F(z,\\theta)=0"));
  assert.equal(project.propertyAnalyses?.length, 3);
  assert.equal(run?.workflowId, "paperforge-research-workflow");
  assert.equal(run?.action, "analyze_properties");
  assert.equal(run?.steps.length, 3);
  assert.match(
    run?.steps
      .flatMap((step) => step.details ?? [])
      .map((detail) => detail.value)
      .join("\n") ?? "",
    /local fixture|implicit_system|analysis/
  );
});

test("implicit-system fixture seeds the local development project store", () => {
  withTempDevelopmentProjectStore(() => {
    clearDevelopmentProjectStoreForTests();

    const seeded = seedImplicitSystemDevelopmentFixture(
      "owner-a",
      1710000300000
    );
    const stored = getDevelopmentProject("owner-a", seeded.id);

    assert.equal(seeded.id, IMPLICIT_SYSTEM_FIXTURE_PROJECT_ID);
    assert.equal(stored?.equilibriumResult?.status, "implicit_system");
    assert.equal(stored?.researchSession?.phase, "analysis");
    assert.equal(
      stored?.researchSession?.agentRuns?.at(-1)?.action,
      "analyze_properties"
    );
  });
});

function withTempDevelopmentProjectStore(callback) {
  const previousStorePath = process.env.PAPERFORGE_DEV_PROJECT_STORE_PATH;
  const directory = mkdtempSync(join(tmpdir(), "paperforge-fixture-store-"));

  try {
    process.env.PAPERFORGE_DEV_PROJECT_STORE_PATH = join(
      directory,
      "projects.json"
    );
    callback();
  } finally {
    clearDevelopmentProjectStoreForTests();
    restoreEnv("PAPERFORGE_DEV_PROJECT_STORE_PATH", previousStorePath);
    rmSync(directory, { recursive: true, force: true });
  }
}

function restoreEnv(key, value) {
  if (typeof value === "undefined") {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
