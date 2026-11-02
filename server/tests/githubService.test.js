import { afterEach, describe, expect, it, vi } from "vitest";
import githubService from "../services/githubService";

describe("githubService", function () {
  afterEach(function () {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses visitor tokens rather than the environment token", async function () {
    vi.stubEnv("GITHUB_TOKEN", "server-token-must-not-be-used");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);
    await githubService.getAuthenticatedUser("alice-token");
    await githubService.getRepositories("bob-token");
    await githubService.getPullRequests("alice-token", "alice", "project");
    await githubService.getCommits("bob-token", "bob", "project", 1, 10);
    expect(fetchMock.mock.calls.map(([, options]) => options.headers.Authorization)).toEqual([
      "Bearer alice-token", "Bearer bob-token", "Bearer alice-token", "Bearer bob-token",
    ]);
  });

  it("preserves an upstream 401 so revoked logins can be invalidated", async function () {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(githubService.getRepositories("revoked-token")).rejects.toMatchObject({ status: 401 });
  });
});
