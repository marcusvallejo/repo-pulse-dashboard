import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../app";
import { mockUserDatabase } from "./helpers/mockUserDatabase";

describe("Session-authenticated GitHub requests", function () {
  let fetchMock;
  let revokedToken;

  beforeEach(function () {
    mockUserDatabase();
    vi.stubEnv("GITHUB_CLIENT_ID", "test-client");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "test-secret");
    vi.stubEnv("GITHUB_CALLBACK_URL", "http://localhost:4000/api/auth/github/callback");
    vi.stubEnv("FRONTEND_URL", "http://localhost:5173");
    vi.stubEnv("GITHUB_TOKEN", "environment-token-must-not-be-used");
    revokedToken = null;
    fetchMock = vi.fn().mockImplementation(async (url, options) => {
      const token = options.headers.Authorization;
      if (url.includes("access_token")) {
        return { ok: true, json: async () => ({ access_token: `${options.body.get("code")}-token`, expires_in: 60 }) };
      }
      if (token === revokedToken) return { ok: false, status: 401 };
      if (url === "https://api.github.com/user") {
        return { ok: true, json: async () => ({ id: token.includes("alice") ? 1 : 2, login: token.includes("alice") ? "alice" : "bob" }) };
      }
      if (url === "https://api.github.com/user/repos") {
        return { ok: true, json: async () => [{ id: 10, name: "project", full_name: `${token.includes("alice") ? "alice" : "bob"}/project` }] };
      }
      return { ok: true, json: async () => [] };
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(function () {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  async function login(name) {
    const agent = request.agent(app);
    const start = await agent.get("/api/auth/github");
    const state = new URL(start.headers.location).searchParams.get("state");
    const callback = await agent.get("/api/auth/github/callback").query({ state, code: name });
    expect(callback.status).toBe(302);
    return agent;
  }

  it("blocks every data endpoint without a session even when GITHUB_TOKEN exists", async function () {
    for (const path of ["user", "repositories", "repositories/alice/project/pulls", "repositories/alice/project/commits", "repositories/alice/project/analytics"]) {
      const response = await request(app).get(`/api/github/${path}`);
      expect(response.status).toBe(401);
      expect(response.headers["cache-control"]).toBe("no-store");
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps two visitors' tokens separate across profile, repositories, commits, PRs and analytics", async function () {
    const alice = await login("alice");
    const bob = await login("bob");
    for (const [agent, name] of [[alice, "alice"], [bob, "bob"]]) {
      fetchMock.mockClear();
      expect((await agent.get("/api/github/user")).body.login).toBe(name);
      expect((await agent.get("/api/github/repositories")).body[0].fullName).toBe(`${name}/project`);
      expect((await agent.get(`/api/github/repositories/${name}/project/pulls`)).status).toBe(200);
      expect((await agent.get(`/api/github/repositories/${name}/project/commits`)).status).toBe(200);
      expect((await agent.get(`/api/github/repositories/${name}/project/analytics`)).status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(7);
      for (const [, options] of fetchMock.mock.calls) {
        expect(options.headers.Authorization).toBe(`Bearer ${name}-token`);
      }
    }
    expect((await request(app).get("/api/github/repositories")).status).toBe(401);
  });

  it("invalidates only the visitor whose GitHub token was revoked", async function () {
    const alice = await login("alice");
    const bob = await login("bob");
    revokedToken = "Bearer alice-token";
    expect((await alice.get("/api/github/repositories")).status).toBe(401);
    expect((await alice.get("/api/auth/session")).body.authenticated).toBe(false);
    expect((await bob.get("/api/github/repositories")).status).toBe(200);
  });

  it("blocks expired sessions and sessions after logout", async function () {
    const alice = await login("alice");
    expect((await alice.post("/api/auth/logout").set("Origin", "http://localhost:5173")).status).toBe(204);
    fetchMock.mockClear();
    expect((await alice.get("/api/github/repositories")).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();

    const bob = await login("bob");
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 61000);
    fetchMock.mockClear();
    expect((await bob.get("/api/github/repositories")).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
