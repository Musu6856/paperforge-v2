import test from "node:test";
import assert from "node:assert/strict";

import { getConfiguredDatabaseUrl } from "./database-url.ts";
import { getConfiguredMigrationDatabaseUrl } from "./database-url.ts";

test("database URL resolver prefers DATABASE_URL", () => {
  assert.equal(
    getConfiguredDatabaseUrl({
      DATABASE_URL: "postgresql://primary",
      NEON_DATABASE_URL: "postgresql://neon",
    }),
    "postgresql://primary"
  );
});

test("database URL resolver falls back to NEON_DATABASE_URL", () => {
  assert.equal(
    getConfiguredDatabaseUrl({
      DATABASE_URL: "",
      NEON_DATABASE_URL: "postgresql://neon",
    }),
    "postgresql://neon"
  );
});

test("database URL resolver ignores blank values", () => {
  assert.equal(
    getConfiguredDatabaseUrl({
      DATABASE_URL: "   ",
      NEON_DATABASE_URL: "",
    }),
    undefined
  );
});

test("migration database URL resolver prefers unpooled Neon URLs", () => {
  assert.equal(
    getConfiguredMigrationDatabaseUrl({
      DATABASE_URL: "",
      NEON_DATABASE_URL: "postgresql://pooled",
      NEON_DATABASE_URL_UNPOOLED: "postgresql://unpooled",
    }),
    "postgresql://unpooled"
  );
});
