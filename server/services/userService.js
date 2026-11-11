const { randomUUID } = require("node:crypto");
const database = require("../db/pool");

async function saveGithubUser(user) {
  const result = await database.query(
    `INSERT INTO users (id, github_id, github_login, display_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (github_id) DO UPDATE SET
       github_login = EXCLUDED.github_login,
       display_name = EXCLUDED.display_name,
       updated_at = CURRENT_TIMESTAMP
     RETURNING id, github_id, github_login, display_name, created_at, updated_at`,
    [randomUUID(), user.id, user.login, user.name ?? user.login]
  );
  return result.rows[0];
}

module.exports = { saveGithubUser };
