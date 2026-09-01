const express = require("express");
const githubService = require("../services/githubService");

const router = express.Router();

router.get("/status", function (request, response) {
  response.json({
    configured: githubService.hasGithubToken(),
  });
});

router.get("/user", function (request, response) {
  if (!githubService.hasGithubToken()) {
    return response.status(401).json({
      error: "GitHub token is not configured",
    });
  }

  response.json({
    message: "GitHub user lookup is not implemented yet",
  });
});

module.exports = router;
