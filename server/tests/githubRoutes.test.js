import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app";

describe("GitHub API routes", function () {
  it("returns GitHub configuration status", async function () {
    const response = await request(app).get("/api/github/status");

    expect(response.status).toBe(200);
    expect(response.body.configured).toEqual(expect.any(Boolean));
  });
});