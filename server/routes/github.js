const express = require("express");
const githubService = require("../services/githubService");

const router = express.Router();

router.get("/status", function (request, response) {
  response.json({
    configured: githubService.hasGithubToken(),
  });
});

router.get("/user", async function (request, response) {
  if (!githubService.hasGithubToken()) {
    return response.status(401).json({
      error: "GitHub token is not configured",
    });
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

module.exports = router;
