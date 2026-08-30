const express = require("express");
const githubService = require("../services/githubService");

const router = express.Router();

router.get("/status", function (request, response) {
  response.json({
    configured: githubService.hasGithubToken(),
  });
});

module.exports = router;