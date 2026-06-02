import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { getConfiguredMigrationDatabaseUrl } from "./src/lib/database-url.ts";

loadEnvConfig(process.cwd());

const databaseUrl = getConfiguredMigrationDatabaseUrl();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl!,
  },
});
