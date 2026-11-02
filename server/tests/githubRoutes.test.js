import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../app";

describe("GitHub API routes", function () {
  let authenticatedAgent;

  beforeEach(async function () {
    vi.stubEnv("GITHUB_CLIENT_ID", "test-client");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "test-secret");
    vi.stubEnv("GITHUB_CALLBACK_URL", "http://localhost:4000/api/auth/github/callback");
    vi.stubEnv("FRONTEND_URL", "http://localhost:5173");
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url) => ({
      ok: true,
      json: async () => url.includes("access_token")
        ? { access_token: "visitor-token", expires_in: 28800 }
        : { id: 456, login: "marcusvallejo" },
    })));
    authenticatedAgent = request.agent(app);
    const start = await authenticatedAgent.get("/api/auth/github");
    const state = new URL(start.headers.location).searchParams.get("state");
    const callback = await authenticatedAgent.get("/api/auth/github/callback").query({ state, code: "example" });
    expect(callback.status).toBe(302);
    vi.unstubAllGlobals();
  });

  afterEach(function () {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("returns signed-out GitHub session status", async function () {
    const response = await request(app).get("/api/github/status");

    expect(response.status).toBe(200);
    expect(response.body.authenticated).toBe(false);
  });

  it("returns an error when GitHub user is requested without a session", async function () {

    const response = await request(app).get("/api/github/user");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Sign in with GitHub to continue",
    });
  });

  it("returns a simplified GitHub user", async function () {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async function () {
          return {
            id: 456,
            login: "marcusvallejo",
            name: "Marcus Vallejo",
            avatar_url: "https://avatars.githubusercontent.com/u/456",
            html_url: "https://github.com/marcusvallejo",
            public_repos: 12,
          };
        },
      })
    );

    const response = await authenticatedAgent.get("/api/github/user");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 456,
      login: "marcusvallejo",
      name: "Marcus Vallejo",
      avatarUrl: "https://avatars.githubusercontent.com/u/456",
      profileUrl: "https://github.com/marcusvallejo",
      publicRepos: 12,
    });
  });

  it("returns an error when GitHub repositories are requested without a session", async function () {

    const response = await request(app).get("/api/github/repositories");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Sign in with GitHub to continue",
    });
  });

  it("returns simplified GitHub repositories", async function () {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async function () {
          return [
            {
              id: 123,
              name: "repo-pulse-dashboard",
              full_name: "marcusvallejo/repo-pulse-dashboard",
              private: false,
              html_url: "https://github.com/marcusvallejo/repo-pulse-dashboard",
            },
          ];
        },
      })
    );

    const response = await authenticatedAgent.get("/api/github/repositories");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 123,
        name: "repo-pulse-dashboard",
        fullName: "marcusvallejo/repo-pulse-dashboard",
        private: false,
        url: "https://github.com/marcusvallejo/repo-pulse-dashboard",
      },
    ]);
  });

  it("returns an error when GitHub pull requests are requested without a session", async function () {

    const response = await request(app).get(
      "/api/github/repositories/marcusvallejo/repo-pulse-dashboard/pulls"
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Sign in with GitHub to continue",
    });
  });

  it("returns simplified GitHub pull requests", async function () {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async function () {
          return [
            {
              id: 789,
              title: "Add GitHub pull request analytics",
              number: 4,
              state: "open",
              html_url:
                "https://github.com/marcusvallejo/repo-pulse-dashboard/pull/4",
              user: {
                login: "marcusvallejo",
              },
              created_at: "2026-09-04T10:00:00Z",
            },
          ];
        },
      })
    );

    const response = await authenticatedAgent.get(
      "/api/github/repositories/marcusvallejo/repo-pulse-dashboard/pulls"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 789,
        title: "Add GitHub pull request analytics",
        number: 4,
        state: "open",
        url: "https://github.com/marcusvallejo/repo-pulse-dashboard/pull/4",
        author: "marcusvallejo",
        createdAt: "2026-09-04T10:00:00Z",
      },
    ]);
  });

  it("returns an error when GitHub commits are requested without a session", async function () {

    const response = await request(app).get(
      "/api/github/repositories/marcusvallejo/repo-pulse-dashboard/commits"
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Sign in with GitHub to continue",
    });
  });

  it("returns simplified GitHub commits", async function () {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async function () {
        return [
          {
            sha: "abc123",
            html_url:
              "https://github.com/marcusvallejo/repo-pulse-dashboard/commit/abc123",
            author: {
              login: "marcusvallejo",
            },
            commit: {
              message: "Add GitHub commit activity",
              author: {
                name: "Marcus Vallejo",
                date: "2026-09-06T10:00:00Z",
              },
            },
          },
        ];
      },
    });

    vi.stubGlobal(
      "fetch",
      fetchMock
    );

    const response = await authenticatedAgent.get(
      "/api/github/repositories/marcusvallejo/repo-pulse-dashboard/commits?page=2"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      commits: [
        {
          sha: "abc123",
          message: "Add GitHub commit activity",
          url:
            "https://github.com/marcusvallejo/repo-pulse-dashboard/commit/abc123",
          author: "marcusvallejo",
          createdAt: "2026-09-06T10:00:00Z",
        },
      ],
      pagination: {
        page: 2,
        perPage: 10,
        hasMore: false,
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/marcusvallejo/repo-pulse-dashboard/commits?per_page=10&page=2",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer visitor-token" }) })
    );
  });

  it("returns an error when GitHub analytics are requested without a session", async function () {

    const response = await request(app).get(
      "/api/github/repositories/marcusvallejo/repo-pulse-dashboard/analytics"
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Sign in with GitHub to continue",
    });
  });

  it("returns calculated GitHub repository analytics", async function () {

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async function (url) {
        if (url.includes("pulls?state=open")) {
          return {
            ok: true,
            json: async function () {
              return [{ created_at: "2000-01-01T00:00:00Z" }];
            },
          };
        }

        if (url.includes("pulls?state=closed")) {
          return {
            ok: true,
            json: async function () {
              return [];
            },
          };
        }

        if (url.includes("/commits?")) {
          return {
            ok: true,
            json: async function () {
              return [{
                sha: "abc123",
                commit: { committer: { date: new Date(Date.now() - 60000).toISOString() } },
              }];
            },
          };
        }

        throw new Error(`Unexpected GitHub URL: ${url}`);
      })
    );

    const response = await authenticatedAgent.get(
      "/api/github/repositories/marcusvallejo/repo-pulse-dashboard/analytics"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      openPullRequests: 1,
      stalePullRequests: 1,
      commitsLast30Days: 1,
      averageMergeTimeDays: null,
      windowDays: 30,
      staleAfterDays: 7,
      dailyCommits: expect.any(Array),
      commitActivityMayBeIncomplete: false,
      commitFetchLimit: 100,
      healthScore: 85,
      recommendations: [
        {
          priority: "high",
          title: "Review stale pull requests",
          message: "1 pull request has been open longer than 7 days.",
        },
        {
          priority: "medium",
          title: "Increase repository activity",
          message: "Only 1 commit was made during the last 30 days.",
        },
      ],
    });
  });
});
