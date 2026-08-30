import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app";

describe("RepoPulse API", function () {
  it("returns a healthy API status", async function () {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "repo-pulse-api",
    });
  });

  it("returns repository dashboard data", async function () {
    const response = await request(app).get("/api/repositories/shopfront");

    expect(response.status).toBe(200);
    expect(response.body.metrics).toEqual(expect.any(Array));
    expect(response.body.pullRequests).toEqual(expect.any(Array));
    expect(response.body.activity).toEqual(expect.any(Array));
  });

  it("returns a repository summary", async function () {
    const response = await request(app).get(
      "/api/repositories/shopfront/summary"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "shopfront",
      openPullRequests: "18",
      commits: "146",
      healthScore: "82",
    });
  });

  it("returns a useful error for a missing repository", async function () {
    const response = await request(app).get("/api/repositories/not-real");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Repository not found",
      availableRepositories: ["shopfront", "api-service", "mobile-app"],
    });
  });
});
