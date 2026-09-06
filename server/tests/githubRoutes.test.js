import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import app from "../app";

describe("GitHub API routes", function () {
  const originalGithubToken = process.env.GITHUB_TOKEN;

  afterEach(function () {
    process.env.GITHUB_TOKEN = originalGithubToken;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns GitHub configuration status", async function () {
    const response = await request(app).get("/api/github/status");

    expect(response.status).toBe(200);
    expect(response.body.configured).toEqual(expect.any(Boolean));
  });

  it("returns an error when GitHub user is requested without a token", async function () {
    delete process.env.GITHUB_TOKEN;

    const response = await request(app).get("/api/github/user");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "GitHub token is not configured",
    });
  });

  it("returns a simplified GitHub user", async function () {
    process.env.GITHUB_TOKEN = "fake-token";
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

    const response = await request(app).get("/api/github/user");

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

  it("returns an error when GitHub repositories are requested without a token", async function () {
    delete process.env.GITHUB_TOKEN;

    const response = await request(app).get("/api/github/repositories");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "GitHub token is not configured",
    });
  });

  it("returns simplified GitHub repositories", async function () {
    process.env.GITHUB_TOKEN = "fake-token";
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

    const response = await request(app).get("/api/github/repositories");

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

  it("returns an error when GitHub pull requests are requested without a token", async function () {
    delete process.env.GITHUB_TOKEN;

    const response = await request(app).get(
      "/api/github/repositories/marcusvallejo/repo-pulse-dashboard/pulls"
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "GitHub token is not configured",
    });
  });

  it("returns simplified GitHub pull requests", async function () {
    process.env.GITHUB_TOKEN = "fake-token";
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

    const response = await request(app).get(
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

  it("returns an error when GitHub commits are requested without a token", async function () {
    delete process.env.GITHUB_TOKEN;

    const response = await request(app).get(
      "/api/github/repositories/marcusvallejo/repo-pulse-dashboard/commits"
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "GitHub token is not configured",
    });
  });

  it("returns simplified GitHub commits", async function () {
    process.env.GITHUB_TOKEN = "fake-token";
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

    const response = await request(app).get(
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
      expect.any(Object)
    );
  });
});
