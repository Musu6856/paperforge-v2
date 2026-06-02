const DATABASE_URL_KEYS = [
  "DATABASE_URL",
  "NEON_DATABASE_URL",
  "NEON_POSTGRES_URL",
] as const;

const MIGRATION_DATABASE_URL_KEYS = [
  "DATABASE_URL",
  "NEON_DATABASE_URL_UNPOOLED",
  "NEON_POSTGRES_URL_NON_POOLING",
  "NEON_DATABASE_URL",
] as const;

export function getConfiguredDatabaseUrl(
  env: Record<string, string | undefined> = process.env
) {
  return getFirstNonEmptyEnvValue(env, DATABASE_URL_KEYS);
}

export function getConfiguredMigrationDatabaseUrl(
  env: Record<string, string | undefined> = process.env
) {
  return getFirstNonEmptyEnvValue(env, MIGRATION_DATABASE_URL_KEYS);
}

function getFirstNonEmptyEnvValue(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
  keys: readonly string[]
) {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) return value;
  }

  return undefined;
}
