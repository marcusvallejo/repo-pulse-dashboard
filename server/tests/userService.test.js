import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockUserDatabase } from "./helpers/mockUserDatabase";

const userService = createRequire(import.meta.url)("../services/userService");

describe("Persisting GitHub users", function () {
  afterEach(() => vi.restoreAllMocks());

  it("sends identity fields as SQL parameters and ignores credentials in the input", async function () {
    const query = mockUserDatabase();
    const user = { id: 123, login: "developer", name: "O'Brien; DROP TABLE users;", accessToken: "never-persist-this", password: "never-persist-this-either" };
    const saved = await userService.saveGithubUser(user);
    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain("VALUES ($1, $2, $3, $4)");
    expect(sql).toContain("ON CONFLICT (github_id) DO UPDATE");
    expect(sql).not.toContain(user.name);
    expect(values).toEqual([expect.stringMatching(/^[a-f0-9-]{36}$/), 123, "developer", user.name]);
    expect(JSON.stringify(query.mock.calls)).not.toContain("never-persist");
    expect(saved.id).toBe("00000000-0000-4000-8000-000000000001");
  });

  it("uses the login when the display name is absent", async function () {
    const query = mockUserDatabase();
    await userService.saveGithubUser({ id: 123, login: "developer", name: null });
    expect(query.mock.calls[0][1][3]).toBe("developer");
  });
});
