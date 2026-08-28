const express = require("express");
const repositories = require("../data/repositories.json");

const router = express.Router();

function sendRepositoryNotFound(response) {
  return response.status(404).json({
    error: "Repository not found",
    availableRepositories: Object.keys(repositories),
  });
}

function findMetricValue(repository, label) {
  const metric = repository.metrics.find(function (metric) {
    return metric.label === label;
  });

  return metric?.value;
}

router.get("/", function (request, response) {
  response.json(repositories);
});

router.get("/:repositoryId/summary", function (request, response) {
  const repositoryId = request.params.repositoryId;
  const repository = repositories[repositoryId];

  if (!repository) {
    return sendRepositoryNotFound(response);
  }

  response.json({
    id: repositoryId,
    openPullRequests: findMetricValue(repository, "Open PRs"),
    commits: findMetricValue(repository, "Commits"),
    healthScore: findMetricValue(repository, "Health score"),
  });
});

router.get("/:repositoryId", function (request, response) {
  const repositoryId = request.params.repositoryId;
  const repository = repositories[repositoryId];

  if (!repository) {
    return sendRepositoryNotFound(response);
  }

  response.json(repository);
});

module.exports = router;
