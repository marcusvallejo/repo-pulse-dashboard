const session = require("express-session");
const { randomBytes } = require("node:crypto");

// MemoryStore is for local development; deployment needs a persistent store and HTTPS.
if (process.env.NODE_ENV === "production") {
  throw new Error("Configure a persistent session store before deploying OAuth");
}

const sessionMiddleware = session({
  name: "repopulse.sid",
  secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 8 * 60 * 60 * 1000 },
});

function expireSession(request, response, next) {
  response.set("Cache-Control", "no-store");
  response.set("Referrer-Policy", "no-referrer");
  if (request.session.auth?.expiresAt <= Date.now()) {
    delete request.session.auth;
  }
  next();
}

function requireGithubSession(request, response, next) {
  if (!request.session.auth?.accessToken) {
    return response.status(401).json({ error: "Sign in with GitHub to continue" });
  }
  next();
}

module.exports = { sessionMiddleware, expireSession, requireGithubSession };
