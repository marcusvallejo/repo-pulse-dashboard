import request from "supertest";
import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../app";
import githubAuthService from "../services/githubAuthService";

describe("GitHub OAuth routes", function () {
  beforeEach(function () {
    vi.stubEnv("GITHUB_CLIENT_ID", "test-client");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "test-secret");
    vi.stubEnv("GITHUB_CALLBACK_URL", "http://localhost:4000/api/auth/github/callback");
    vi.stubEnv("FRONTEND_URL", "http://localhost:5173");
  });

  afterEach(function () {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function startLogin(agent) {
    const response = await agent.get("/api/auth/github");
    expect(response.status).toBe(302);
    return { response, url: new URL(response.headers.location) };
  }

  function mockGithubLogin(expiresIn = 28800) {
    const fetchMock = vi.fn().mockImplementation(async function (url) {
      if (url === "https://github.com/login/oauth/access_token") {
        return { ok: true, json: async () => ({ access_token: "private-access-token", expires_in: expiresIn }) };
      }
      if (url === "https://api.github.com/user") {
        return { ok: true, json: async () => ({ id: 123, login: "test-user", name: "Test User" }) };
      }
      throw new Error("Unexpected fetch URL");
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("reports signed-out status without setting a cookie", async function () {
    const response = await request(app).get("/api/auth/session");
    expect(response.body).toEqual({ authenticated: false, user: null, expiresAt: null });
    expect(response.headers["set-cookie"]).toBeUndefined();
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("requires OAuth configuration", async function () {
    vi.stubEnv("GITHUB_CLIENT_SECRET", "");
    expect((await request(app).get("/api/auth/github")).status).toBe(503);
  });

  it("redirects to GitHub with state, PKCE, callback URL and an HttpOnly cookie", async function () {
    const { response, url } = await startLogin(request.agent(app));
    expect(url.origin + url.pathname).toBe("https://github.com/login/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("test-client");
    expect(url.searchParams.get("redirect_uri")).toBe(process.env.GITHUB_CALLBACK_URL);
    expect(url.searchParams.get("state")).toMatch(/^[a-f0-9]{64}$/);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toHaveLength(43);
    expect(url.searchParams.get("scope")).toBe("");
    expect(url.toString()).not.toContain("test-secret");
    expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
    expect(response.headers["set-cookie"][0]).toContain("SameSite=Lax");
  });

  it("rejects missing, mismatched and foreign-browser callbacks before contacting GitHub", async function () {
    const exchange = vi.fn();
    vi.stubGlobal("fetch", exchange);
    const agent = request.agent(app);
    const { url } = await startLogin(agent);
    const state = url.searchParams.get("state");
    expect((await agent.get("/api/auth/github/callback?code=example")).status).toBe(400);
    expect((await agent.get("/api/auth/github/callback").query({ code: "example", state: "x".repeat(64) })).status).toBe(400);
    expect((await request(app).get("/api/auth/github/callback").query({ code: "example", state })).status).toBe(400);
    expect(exchange).not.toHaveBeenCalled();
  });

  it("rejects login attempts older than ten minutes", async function () {
    const now = Date.now();
    const clock = vi.spyOn(Date, "now").mockReturnValue(now);
    const agent = request.agent(app);
    const { url } = await startLogin(agent);
    clock.mockReturnValue(now + 11 * 60 * 1000);
    expect((await agent.get("/api/auth/github/callback").query({ state: url.searchParams.get("state"), code: "example" })).status).toBe(400);
  });

  it("handles cancellation and consumes the attempted login", async function () {
    const exchange = vi.fn();
    vi.stubGlobal("fetch", exchange);
    const agent = request.agent(app);
    const { url } = await startLogin(agent);
    const state = url.searchParams.get("state");
    expect((await agent.get("/api/auth/github/callback").query({ state, error: "access_denied" })).status).toBe(400);
    expect((await agent.get("/api/auth/github/callback").query({ state, code: "example" })).status).toBe(400);
    expect(exchange).not.toHaveBeenCalled();
  });

  it("creates an isolated session, rotates its ID, and never exposes the token", async function () {
    const fetchMock = mockGithubLogin();
    const agent = request.agent(app);
    const { response: start, url } = await startLogin(agent);
    const callback = await agent.get("/api/auth/github/callback").query({ state: url.searchParams.get("state"), code: "example" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(callback.status).toBe(302);
    expect(callback.headers.location).toBe("http://localhost:5173");
    expect(callback.headers["set-cookie"][0].split(";")[0]).not.toBe(start.headers["set-cookie"][0].split(";")[0]);
    const verifier = fetchMock.mock.calls[0][1].body.get("code_verifier");
    expect(createHash("sha256").update(verifier).digest("base64url")).toBe(url.searchParams.get("code_challenge"));
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer private-access-token");

    const status = await agent.get("/api/auth/session");
    expect(status.body).toEqual({ authenticated: true, user: { id: 123, login: "test-user", name: "Test User" }, expiresAt: expect.any(Number) });
    expect(status.text).not.toContain("private-access-token");
    expect((await request(app).get("/api/auth/session")).body.authenticated).toBe(false);
    expect((await agent.get("/api/auth/github/callback").query({ state: url.searchParams.get("state"), code: "example" })).status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("requires login again when an expiring token reaches its lifetime", async function () {
    mockGithubLogin(60);
    const now = Date.now();
    const clock = vi.spyOn(Date, "now").mockReturnValue(now);
    const agent = request.agent(app);
    const { url } = await startLogin(agent);
    await agent.get("/api/auth/github/callback").query({ state: url.searchParams.get("state"), code: "example" });
    expect((await agent.get("/api/auth/session")).body.authenticated).toBe(true);
    clock.mockReturnValue(now + 61000);
    expect((await agent.get("/api/auth/session")).body.authenticated).toBe(false);
  });

  it("returns a safe error when GitHub rejects the code exchange", async function () {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("secret upstream detail")));
    const agent = request.agent(app);
    const { url } = await startLogin(agent);
    const response = await agent.get("/api/auth/github/callback").query({ state: url.searchParams.get("state"), code: "example" });
    expect(response.status).toBe(502);
    expect(response.text).not.toContain("secret upstream detail");
    expect((await agent.get("/api/auth/session")).body.authenticated).toBe(false);
  });

  it("rejects cross-origin logout and destroys the session for RepoPulse logout", async function () {
    mockGithubLogin();
    const agent = request.agent(app);
    const { url } = await startLogin(agent);
    await agent.get("/api/auth/github/callback").query({ state: url.searchParams.get("state"), code: "example" });
    expect((await agent.post("/api/auth/logout").set("Origin", "https://other.example")).status).toBe(403);
    expect((await agent.get("/api/auth/session")).body.authenticated).toBe(true);
    expect((await agent.post("/api/auth/logout").set("Origin", "http://localhost:5173")).status).toBe(204);
    expect((await agent.get("/api/auth/session")).body.authenticated).toBe(false);
  });
});

describe("GitHub OAuth token exchange", function () {
  afterEach(function () {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends credentials in the POST body and rejects GitHub error responses even with HTTP 200", async function () {
    vi.stubEnv("GITHUB_CLIENT_ID", "test-client");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "test-secret");
    vi.stubEnv("GITHUB_CALLBACK_URL", "http://localhost:4000/api/auth/github/callback");
    vi.stubEnv("FRONTEND_URL", "http://localhost:5173");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error: "bad_verification_code" }) });
    vi.stubGlobal("fetch", fetchMock);
    await expect(githubAuthService.exchangeCode("example-code", "example-verifier")).rejects.toThrow("GitHub token exchange failed");
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://github.com/login/oauth/access_token");
    expect(options.method).toBe("POST");
    expect(options.body.get("client_secret")).toBe("test-secret");
    expect(options.body.get("code_verifier")).toBe("example-verifier");
  });
});
