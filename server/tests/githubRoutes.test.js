import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app";

describe("GitHub API routes", function () {
  it("returns GitHub configuration status", async function () {
    const response = await request(app).get("/api/github/status");

    expect(response.status).toBe(200);
    expect(response.body.configured).toEqual(expect.any(Boolean));
  });

  it("returns an error when GitHub user is requested without a token", async function () {
    const response = await request(app).get("/api/github/user");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "GitHub token is not configured",
    });
  });
});
