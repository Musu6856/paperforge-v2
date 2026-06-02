import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  clearDevelopmentProjectStoreForTests,
  createDevelopmentProject,
  deleteDevelopmentProject,
  getDevelopmentProject,
  isDevelopmentProjectStoreEnabled,
  listDevelopmentProjects,
  updateDevelopmentProject,
} from "./development-project-store.ts";
import { createExplorationProject } from "./research-session.ts";

test("development project store is enabled only for local development without a configured database URL", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousNeonDatabaseUrl = process.env.NEON_DATABASE_URL;

  try {
    process.env.NODE_ENV = "development";
    delete process.env.DATABASE_URL;
    delete process.env.NEON_DATABASE_URL;
    assert.equal(isDevelopmentProjectStoreEnabled(), true);

    process.env.DATABASE_URL = "postgresql://example";
    assert.equal(isDevelopmentProjectStoreEnabled(), false);

    delete process.env.DATABASE_URL;
    process.env.NEON_DATABASE_URL = "postgresql://neon-example";
    assert.equal(isDevelopmentProjectStoreEnabled(), false);

    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.NEON_DATABASE_URL;
    assert.equal(isDevelopmentProjectStoreEnabled(), false);
  } finally {
    restoreEnv("NODE_ENV", previousNodeEnv);
    restoreEnv("DATABASE_URL", previousDatabaseUrl);
    restoreEnv("NEON_DATABASE_URL", previousNeonDatabaseUrl);
  }
});

test("development project store keeps project CRUD isolated by owner", () => {
  withTempDevelopmentProjectStore(() => {
    clearDevelopmentProjectStoreForTests();
    const first = createExplorationProject({
      id: "11111111-1111-4111-8111-111111111111",
      rawIdea: "first local project",
      now: 1710000000000,
    });
    const second = createExplorationProject({
      id: "22222222-2222-4222-8222-222222222222",
      rawIdea: "second local project",
      now: 1710000001000,
    });

    createDevelopmentProject("owner-a", first);
    createDevelopmentProject("owner-a", second);
    createDevelopmentProject("owner-b", {
      ...first,
      id: "33333333-3333-4333-8333-333333333333",
    });

    assert.deepEqual(
      listDevelopmentProjects("owner-a").map((project) => project.id),
      [second.id, first.id]
    );
    assert.equal(getDevelopmentProject("owner-a", first.id)?.rawIdea, first.rawIdea);
    assert.equal(getDevelopmentProject("owner-b", first.id), null);

    const updated = updateDevelopmentProject("owner-a", {
      ...first,
      refinedIdea: "updated local project",
    });
    assert.equal(updated?.refinedIdea, "updated local project");
    assert.equal(getDevelopmentProject("owner-a", first.id)?.refinedIdea, "updated local project");

    assert.equal(deleteDevelopmentProject("owner-a", first.id), true);
    assert.equal(getDevelopmentProject("owner-a", first.id), null);
    assert.equal(deleteDevelopmentProject("owner-a", "missing"), false);
  });
});

test("development project store persists projects across in-memory resets", () => {
  withTempDevelopmentProjectStore(() => {
    clearDevelopmentProjectStoreForTests();
    const project = createExplorationProject({
      id: "44444444-4444-4444-8444-444444444444",
      rawIdea: "persisted local project",
      now: 1710000000000,
    });

    createDevelopmentProject("owner-a", project);
    clearDevelopmentProjectStoreForTests();

    assert.deepEqual(
      listDevelopmentProjects("owner-a").map((item) => item.id),
      [project.id]
    );
    assert.equal(
      getDevelopmentProject("owner-a", project.id)?.rawIdea,
      "persisted local project"
    );
  });
});

test("development project store reloads when an external seed updates the store file", () => {
  withTempDevelopmentProjectStore(() => {
    clearDevelopmentProjectStoreForTests();
    const first = createExplorationProject({
      id: "55555555-5555-4555-8555-555555555555",
      rawIdea: "first local project",
      now: 1710000000000,
    });
    const second = createExplorationProject({
      id: "66666666-6666-4666-8666-666666666666",
      rawIdea: "externally seeded project",
      now: 1710000001000,
    });

    createDevelopmentProject("owner-a", first);
    assert.deepEqual(
      listDevelopmentProjects("owner-a").map((project) => project.id),
      [first.id]
    );

    const storePath = process.env.PAPERFORGE_DEV_PROJECT_STORE_PATH;
    const payload = JSON.parse(readFileSync(storePath, "utf8"));
    payload["owner-a"].push(second);
    writeFileSync(storePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

    assert.deepEqual(
      listDevelopmentProjects("owner-a").map((project) => project.id),
      [second.id, first.id]
    );
  });
});

function restoreEnv(key, value) {
  if (typeof value === "undefined") {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

function withTempDevelopmentProjectStore(callback) {
  const previousStorePath = process.env.PAPERFORGE_DEV_PROJECT_STORE_PATH;
  const directory = mkdtempSync(join(tmpdir(), "paperforge-dev-store-"));

  try {
    process.env.PAPERFORGE_DEV_PROJECT_STORE_PATH = join(directory, "projects.json");
    callback();
  } finally {
    clearDevelopmentProjectStoreForTests();
    restoreEnv("PAPERFORGE_DEV_PROJECT_STORE_PATH", previousStorePath);
    rmSync(directory, { recursive: true, force: true });
  }
}
