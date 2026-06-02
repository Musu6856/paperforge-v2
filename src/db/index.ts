import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { getConfiguredDatabaseUrl } from "@/lib/database-url";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let database: Database | null = null;

export function getDb() {
  if (!database) {
    const databaseUrl = getConfiguredDatabaseUrl();

    if (!databaseUrl) {
      throw new Error("DATABASE_URL or NEON_DATABASE_URL is not configured");
    }

    database = drizzle(neon(databaseUrl), { schema });
  }

  return database;
}
