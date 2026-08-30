const repositories = require("../data/repositories.json");

function getAllRepositories() {
  return repositories;
}

function getAvailableRepositoryIds() {
  return Object.keys(repositories);
}

function getRepositoryById(repositoryId) {
  return repositories[repositoryId];
}

function findMetricValue(repository, label) {
  const metric = repository.metrics.find(function (metric) {
    return metric.label === label;
  });

  return metric?.value;
}

function getRepositorySummary(repositoryId) {
  const repository = getRepositoryById(repositoryId);

  if (!repository) {
    return null;
  }

  return {
    id: repositoryId,
    openPullRequests: findMetricValue(repository, "Open PRs"),
    commits: findMetricValue(repository, "Commits"),
    healthScore: findMetricValue(repository, "Health score"),
  };
}

module.exports = {
  getAllRepositories,
  getAvailableRepositoryIds,
  getRepositoryById,
  getRepositorySummary,
};
