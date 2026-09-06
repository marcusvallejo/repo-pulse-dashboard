const express = require("express");
const repositoriesRouter = require("./routes/repositories");
const githubRouter = require("./routes/github");

const app = express();

app.get("/", function (request, response) {
  response.json({
    service: "RepoPulse API",
    status: "running",
    endpoints: [
      "/api/health",
      "/api/repositories",
      "/api/repositories/:repositoryId",
      "/api/repositories/:repositoryId/summary",
      "/api/github/status",
      "/api/github/user",
      "/api/github/repositories",
      "/api/github/repositories/:owner/:repo/pulls",
      "/api/github/repositories/:owner/:repo/commits?page=1",
    ],
  });
});

app.get("/api/health", function (request, response) {
  response.json({
    status: "ok",
    service: "repo-pulse-api",
  });
});

app.use("/api/repositories", repositoriesRouter);

app.use("/api/github", githubRouter);

module.exports = app;
