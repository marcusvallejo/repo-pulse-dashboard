const express = require("express");
const repositoryService = require("../services/repositoryService");

const router = express.Router();

function sendRepositoryNotFound(response) {
  return response.status(404).json({
    error: "Repository not found",
    availableRepositories: repositoryService.getAvailableRepositoryIds(),
  });
}

router.get("/", function (request, response) {
  response.json(repositoryService.getAllRepositories());
});

router.get("/:repositoryId/summary", function (request, response) {
  const repositoryId = request.params.repositoryId;
  const repository = repositoryService.getRepositoryById(repositoryId);

  if (!repository) {
    return sendRepositoryNotFound(response);
  }

  response.json(repositoryService.getRepositorySummary(repositoryId));
});

router.get("/:repositoryId", function (request, response) {
  const repositoryId = request.params.repositoryId;
  const repository = repositoryService.getRepositoryById(repositoryId);

  if (!repository) {
    return sendRepositoryNotFound(response);
  }

  response.json(repository);
});

module.exports = router;
