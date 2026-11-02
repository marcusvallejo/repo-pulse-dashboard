const express = require("express");
const { randomBytes, createHash, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");
const githubAuthService = require("../services/githubAuthService");

const router = express.Router();
const LOGIN_LIFETIME_MS = 10 * 60 * 1000;
const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;

router.get("/session", function (request, response) {
  const auth = request.session.auth;
  response.json({ authenticated: Boolean(auth), user: auth?.user ?? null, expiresAt: auth?.expiresAt ?? null });
});

router.get("/github", async function (request, response) {
  let config;
  try {
    config = githubAuthService.getConfig();
  } catch {
    return response.status(503).json({ error: "GitHub OAuth is not configured. Check the backend environment settings." });
  }

  const state = randomBytes(32).toString("hex");
  const verifier = randomBytes(32).toString("base64url");
  request.session.oauth = { state, verifier, createdAt: Date.now() };
  await promisify(request.session.save).call(request.session);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    state,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
    // Start with public identity/repositories; do not request broad private-repo write access.
    scope: "",
  }).toString();
  response.redirect(url.toString());
});

router.get("/github/callback", async function (request, response) {
  const pending = request.session.oauth;
  const state = request.query.state;
  const matches = pending && typeof state === "string" && /^[a-f0-9]{64}$/.test(state) &&
    state.length === pending.state.length &&
    timingSafeEqual(Buffer.from(state), Buffer.from(pending.state));

  if (!matches || Date.now() - pending.createdAt > LOGIN_LIFETIME_MS) {
    return response.status(400).json({ error: "Invalid or expired login request. Start GitHub login again." });
  }

  // Consume the login attempt before contacting GitHub so its callback cannot be replayed.
  delete request.session.oauth;
  await promisify(request.session.save).call(request.session);

  if (request.query.error || typeof request.query.code !== "string" || !request.query.code) {
    return response.status(400).json({ error: "GitHub login was cancelled or returned no code. Start login again." });
  }

  try {
    const config = githubAuthService.getConfig();
    const tokens = await githubAuthService.exchangeCode(request.query.code, pending.verifier);
    const user = await githubAuthService.getUser(tokens.access_token);
    const expiresIn = Number(tokens.expires_in);
    const lifetime = Number.isFinite(expiresIn) && expiresIn > 0
      ? Math.min(expiresIn * 1000, SESSION_LIFETIME_MS)
      : SESSION_LIFETIME_MS;

    await promisify(request.session.regenerate).call(request.session);
    request.session.auth = {
      accessToken: tokens.access_token,
      user,
      expiresAt: Date.now() + lifetime,
    };
    request.session.cookie.maxAge = lifetime;
    await promisify(request.session.save).call(request.session);
    response.redirect(config.frontendUrl);
  } catch {
    response.status(502).json({ error: "Could not complete GitHub login. Start login again." });
  }
});

router.post("/logout", async function (request, response) {
  let config;
  try {
    config = githubAuthService.getConfig();
  } catch {
    return response.status(503).json({ error: "GitHub OAuth is not configured" });
  }
  const allowedOrigins = [new URL(config.frontendUrl).origin, new URL(config.callbackUrl).origin];
  if (!allowedOrigins.includes(request.get("Origin"))) {
    return response.status(403).json({ error: "Logout must originate from RepoPulse" });
  }
  await promisify(request.session.destroy).call(request.session);
  response.clearCookie("repopulse.sid", { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  response.sendStatus(204);
});

module.exports = router;
