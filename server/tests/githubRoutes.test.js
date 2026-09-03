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
});
