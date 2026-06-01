import test from "node:test";
import assert from "node:assert/strict";

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

test("development project store is enabled only for local development without DATABASE_URL", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDatabaseUrl = process.env.DATABASE_URL;

  try {
    process.env.NODE_ENV = "development";
    delete process.env.DATABASE_URL;
    assert.equal(isDevelopmentProjectStoreEnabled(), true);

    process.env.DATABASE_URL = "postgresql://example";
    assert.equal(isDevelopmentProjectStoreEnabled(), false);

    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    assert.equal(isDevelopmentProjectStoreEnabled(), false);
  } finally {
    restoreEnv("NODE_ENV", previousNodeEnv);
    restoreEnv("DATABASE_URL", previousDatabaseUrl);
  }
});

test("development project store keeps project CRUD isolated by owner", () => {
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

function restoreEnv(key, value) {
  if (typeof value === "undefined") {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
