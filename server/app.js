const express = require("express");
const githubRouter = require("./routes/github");

const app = express();

app.get("/", function (request, response) {
  response.json({
    service: "RepoPulse API",
    status: "running",
    endpoints: [
      "/api/health",
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

app.use("/api/github", githubRouter);

module.exports = app;
