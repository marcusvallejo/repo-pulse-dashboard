const express = require("express");
const githubService = require("../services/githubService");

const router = express.Router();

function sendGithubTokenNotConfigured(response) {
  return response.status(401).json({
    error: "GitHub token is not configured",
  });
}

router.get("/status", function (request, response) {
  response.json({
    configured: githubService.hasGithubToken(),
  });
});

router.get("/user", async function (request, response) {
  if (!githubService.hasGithubToken()) {
    return sendGithubTokenNotConfigured(response);
  }

  try {
    const user = await githubService.getAuthenticatedUser();
    response.json(user);
  } catch (error) {
    console.error(error);

    response.status(502).json({
      error: "Could not load GitHub user",
    });
  }
});

router.get("/repositories", async function (request, response) {
  if (!githubService.hasGithubToken()) {
    return sendGithubTokenNotConfigured(response);
  }

  try {
    const repositories = await githubService.getRepositories();

    response.json(
      repositories.map(function (repository) {
        return {
          id: repository.id,
          name: repository.name,
          fullName: repository.full_name,
          private: repository.private,
          url: repository.html_url,
        };
      })
    );
  } catch (error) {
    console.error(error);

    response.status(502).json({
      error: "Could not load GitHub repositories",
    });
  }
});

module.exports = router;
