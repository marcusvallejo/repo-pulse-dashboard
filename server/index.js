const express = require("express");
const repositories = require("./data/repositories.json");

const app = express();
const PORT = 4000;

app.get("/api/health", function (request, response) {
  response.json({
    status: "ok",
    service: "repo-pulse-api",
  });
});

app.get("/api/repositories", function (request, response) {
  response.json(repositories);
});

app.get("/api/repositories/:repositoryId", function (request, response) {
  const repositoryId = request.params.repositoryId;
  const repository = repositories[repositoryId];

  if (!repository) {
    return response.status(404).json({
      error: "Repository not found",
    });
  }

  response.json(repository);
});

app.listen(PORT, function () {
  console.log(`RepoPulse API running at http://localhost:${PORT}`);
});
