import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import app from "../app";

describe("GitHub API routes", function () {
  const originalGithubToken = process.env.GITHUB_TOKEN;

  afterEach(function () {
    process.env.GITHUB_TOKEN = originalGithubToken;
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
});
