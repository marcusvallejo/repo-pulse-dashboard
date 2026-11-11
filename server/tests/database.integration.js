const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Client } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });

test("PostgreSQL user persistence and application permissions", async function (t) {
  assert.ok(process.env.DATABASE_ADMIN_URL && process.env.DATABASE_URL, "Configure the local database and run db:migrate first");
  const admin = new Client({ connectionString: process.env.DATABASE_ADMIN_URL, connectionTimeoutMillis: 5000 });
  const schema = `repopulse_test_${randomUUID().replaceAll("-", "")}`;
  assert.match(schema, /^repopulse_test_[a-f0-9]{32}$/);
  let created = false;
  const database = require("../db/pool");
  try {
    await admin.connect();
    // Only generated test-schema identifiers are interpolated; all user values are parameters.
    await admin.query(`CREATE SCHEMA "${schema}"`);
    created = true;
    await admin.query(`SET search_path TO "${schema}"`);
    await admin.query(await fs.readFile(path.join(__dirname, "../db/migrations/001_create_users.sql"), "utf8"));
    await admin.query(`GRANT USAGE ON SCHEMA "${schema}" TO repopulse_app`);
    await admin.query(`GRANT SELECT, INSERT, UPDATE ON "${schema}".users TO repopulse_app`);

    const testUrl = new URL(process.env.DATABASE_URL);
    testUrl.searchParams.set("options", `-c search_path=${schema}`);
    process.env.DATABASE_URL = testUrl.toString();
    const { saveGithubUser } = require("../services/userService");
    const first = await saveGithubUser({ id: 123, login: "first-login", name: "First Name" });
    const updated = await saveGithubUser({ id: 123, login: "renamed-login", name: "Updated Name" });
    assert.equal(updated.id, first.id);
    assert.equal(updated.github_login, "renamed-login");
    assert.equal(updated.created_at.getTime(), first.created_at.getTime());
    assert.ok(updated.updated_at >= first.updated_at);

    const concurrent = await Promise.all(Array.from({ length: 5 }, () => saveGithubUser({ id: 123, login: "renamed-login", name: "Updated Name" })));
    assert.ok(concurrent.every((row) => row.id === first.id));
    const other = await saveGithubUser({ id: 456, login: "other-user", name: "O'Brien'; DROP TABLE users; --", accessToken: "must-not-be-saved" });
    assert.notEqual(other.id, first.id);
    assert.equal(other.display_name, "O'Brien'; DROP TABLE users; --");
    const count = await database.query("SELECT count(*)::int AS count FROM users");
    assert.equal(count.rows[0].count, 2);
    const columns = await database.query("SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'users' ORDER BY ordinal_position", [schema]);
    assert.deepEqual(columns.rows.map((row) => row.column_name), ["id", "github_id", "github_login", "display_name", "created_at", "updated_at"]);
    await assert.rejects(database.query("DELETE FROM users"), { code: "42501" });
    await assert.rejects(database.query("DROP TABLE users"), { code: "42501" });
    t.diagnostic("Verified upsert, concurrent login uniqueness, parameter safety, identity-only schema, and restricted app permissions.");
  } finally {
    await database.close();
    if (created) await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});
