import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";

import * as schema from "../src/db/schema.ts";
import { createSimpleEquilibriumFixtureProject } from "../src/lib/development-fixtures.ts";
import { getConfiguredDatabaseUrl } from "../src/lib/database-url.ts";
import { projectFromRow } from "../src/lib/project-records.ts";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const { projects } = schema;
const databaseUrl = getConfiguredDatabaseUrl();

if (!databaseUrl) {
  console.error(
    "DATABASE_URL or NEON_DATABASE_URL is required for the production project persistence smoke."
  );
  process.exit(1);
}

const ownerId = process.env.PAPERFORGE_SMOKE_OWNER_ID ?? "production-smoke";
const now = Date.now();
const projectId = randomUUID();
const smokeTitle = `Production persistence smoke ${projectId.slice(0, 8)}`;
const fixture = createSimpleEquilibriumFixtureProject(now);
const project = {
  ...fixture,
  id: projectId,
  createdAt: now,
  rawIdea: smokeTitle,
  refinedIdea: smokeTitle,
};
const db = drizzle(neon(databaseUrl), { schema });
let shouldCleanup = false;

try {
  const [inserted] = await db
    .insert(projects)
    .values(toProjectRow(project, ownerId))
    .returning();

  assert.ok(inserted, "insert should return the created row");
  shouldCleanup = true;

  const stored = projectFromRow(inserted);
  const storedRun = stored.researchSession?.agentRuns?.at(-1);

  assert.equal(stored.id, projectId);
  assert.equal(stored.equilibriumResult?.status, "solved");
  assert.equal(stored.propertyAnalyses?.length, 3);
  assert.equal(storedRun?.workflowId, "paperforge-research-workflow");
  assert.equal(storedRun?.action, "analyze_properties");
  assert.equal(storedRun?.steps.length, 3);

  const updatedTitle = `${smokeTitle} verified`;
  const [updated] = await db
    .update(projects)
    .set({
      refinedIdea: updatedTitle,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
    .returning();

  assert.ok(updated, "update should return the updated row");
  assert.equal(projectFromRow(updated).refinedIdea, updatedTitle);

  console.log(
    JSON.stringify(
      {
        status: "passed",
        ownerId,
        projectId,
        equilibriumStatus: stored.equilibriumResult?.status,
        agentRunSteps: storedRun?.steps.length ?? 0,
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "failed",
        ownerId,
        projectId,
        error: describeError(error),
      },
      null,
      2
    )
  );
  process.exitCode = 1;
} finally {
  if (shouldCleanup) {
    try {
      await db
        .delete(projects)
        .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)));
    } catch (error) {
      console.error(
        JSON.stringify(
          {
            status: "cleanup_failed",
            ownerId,
            projectId,
            error: describeError(error),
          },
          null,
          2
        )
      );
      process.exitCode = 1;
    }
  }
}

function toProjectRow(project, ownerId) {
  return {
    id: project.id,
    ownerId,
    rawIdea: project.rawIdea,
    refinedIdea: project.refinedIdea,
    projectType: project.projectType ?? "legacy",
    model: project.model,
    researchSession: project.researchSession ?? null,
    modelSource: project.modelSource ?? null,
    wizardCompleted: project.wizardCompleted,
    sections: project.sections,
    references: project.references,
    background: project.background ?? null,
    literatureAnalyses: project.literatureAnalyses ?? [],
    hotellingModel: project.hotellingModel ?? null,
    equilibriumResult: project.equilibriumResult ?? null,
    propertyAnalyses: project.propertyAnalyses ?? [],
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(),
  };
}

function describeError(error) {
  const cause = error?.cause;
  const sourceError = cause?.sourceError;
  const sourceCause = sourceError?.cause;
  const fallbackMessage =
    error instanceof Error && error.name !== "DrizzleQueryError"
      ? error.message
      : undefined;

  return {
    name: error?.name ?? "UnknownError",
    message:
      cause?.message ??
      sourceError?.message ??
      sourceCause?.message ??
      fallbackMessage ??
      "Production persistence smoke failed.",
    code: cause?.code ?? sourceCause?.code,
  };
}
