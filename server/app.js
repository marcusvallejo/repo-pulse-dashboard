const express = require("express");
const githubRouter = require("./routes/github");
const authRouter = require("./routes/auth");
const { sessionMiddleware, expireSession } = require("./middleware/session");

const app = express();

app.get("/", function (request, response) {
  response.json({
    service: "RepoPulse API",
    status: "running",
    endpoints: [
      "/api/health",
      "/api/auth/github",
      "/api/auth/github/callback",
      "/api/auth/session",
      "/api/auth/logout",
      "/api/github/status",
      "/api/github/user",
      "/api/github/repositories",
      "/api/github/repositories/:owner/:repo/pulls",
      "/api/github/repositories/:owner/:repo/commits?page=1",
      "/api/github/repositories/:owner/:repo/analytics",
    ],
  });
});

app.get("/api/health", function (request, response) {
  response.json({
    status: "ok",
    service: "repo-pulse-api",
  });
});

app.use("/api", sessionMiddleware, expireSession);
app.use("/api/github", githubRouter);
app.use("/api/auth", authRouter);

module.exports = app;
