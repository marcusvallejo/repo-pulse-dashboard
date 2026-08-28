const express = require("express");
const repositories = require("../data/repositories.json");

const router = express.Router();

router.get("/", function (request, response) {
  response.json(repositories);
});

router.get("/:repositoryId/summary", function (request, response) {
  const repositoryId = request.params.repositoryId;
  const repository = repositories[repositoryId];

  if (!repository) {
    return response.status(404).json({
      error: "Repository not found",
      availableRepositories: Object.keys(repositories),
    });
  }

  response.json({
    id: repositoryId,
    openPullRequests: repository.metrics[0].value,
    commits: repository.metrics[2].value,
    healthScore: repository.metrics[3].value,
  });
});

router.get("/:repositoryId", function (request, response) {
  const repositoryId = request.params.repositoryId;
  const repository = repositories[repositoryId];

  if (!repository) {
    return response.status(404).json({
      error: "Repository not found",
      availableRepositories: Object.keys(repositories),
    });
  }

  response.json(repository);
});

module.exports = router;
