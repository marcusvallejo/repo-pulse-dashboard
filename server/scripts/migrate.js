const fs = require("node:fs/promises");
const path = require("node:path");
const { Client } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });

async function migrate() {
  if (!process.env.DATABASE_ADMIN_URL || !process.env.POSTGRES_APP_PASSWORD) {
    throw new Error("Run npm run db:setup or configure DATABASE_ADMIN_URL and POSTGRES_APP_PASSWORD first");
  }
  const client = new Client({ connectionString: process.env.DATABASE_ADMIN_URL, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(724061)");
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)");
    const directory = path.join(__dirname, "../db/migrations");
    const files = (await fs.readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
    const applied = await client.query("SELECT name FROM schema_migrations");
    const names = new Set(applied.rows.map((row) => row.name));
    for (const file of files) {
      if (names.has(file)) continue;
      await client.query(await fs.readFile(path.join(directory, file), "utf8"));
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      console.log(`Applied ${file}`);
    }

    await client.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'repopulse_app') THEN
        CREATE ROLE repopulse_app LOGIN;
      END IF;
    END $$`);
    const passwordStatement = await client.query("SELECT format('ALTER ROLE repopulse_app PASSWORD %L', $1::text) AS sql", [process.env.POSTGRES_APP_PASSWORD]);
    await client.query(passwordStatement.rows[0].sql);
    await client.query("GRANT USAGE ON SCHEMA public TO repopulse_app");
    await client.query("GRANT SELECT, INSERT, UPDATE ON users TO repopulse_app");
    await client.query("COMMIT");
    console.log("Database migrations complete. Application role has SELECT, INSERT and UPDATE on users.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error("Database migration failed. Check Docker, the database settings, and migration files.");
  console.error(`Error code: ${error.code || "CONFIGURATION_ERROR"}`);
  process.exitCode = 1;
});
