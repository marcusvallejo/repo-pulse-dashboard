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
});
