const express = require("express");
const githubService = require("../services/githubService");

const router = express.Router();
const COMMITS_PER_PAGE = 10;

function getPageNumber(value) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

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

    response.json({
      id: user.id,
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      publicRepos: user.public_repos,
    });
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

router.get("/repositories/:owner/:repo/pulls", async function (request, response) {
  if (!githubService.hasGithubToken()) {
    return sendGithubTokenNotConfigured(response);
  }

  const owner = request.params.owner;
  const repo = request.params.repo;

  try {
    const pullRequests = await githubService.getPullRequests(owner, repo);

    response.json(
      pullRequests.map(function (pullRequest) {
        return {
          id: pullRequest.id,
          title: pullRequest.title,
          number: pullRequest.number,
          state: pullRequest.state,
          url: pullRequest.html_url,
          author: pullRequest.user.login,
          createdAt: pullRequest.created_at,
        };
      })
    );
  } catch (error) {
    console.error(error);

    response.status(502).json({
      error: "Could not load GitHub pull requests",
    });
  }
});

router.get("/repositories/:owner/:repo/commits", async function (request, response) {
  if (!githubService.hasGithubToken()) {
    return sendGithubTokenNotConfigured(response);
  }

  const owner = request.params.owner;
  const repo = request.params.repo;
  const page = getPageNumber(request.query.page);

  try {
    const commits = await githubService.getCommits(
      owner,
      repo,
      page,
      COMMITS_PER_PAGE
    );

    response.json({
      commits: commits.map(function (commit) {
        return {
          sha: commit.sha,
          message: commit.commit.message,
          url: commit.html_url,
          author: commit.author?.login || commit.commit.author.name,
          createdAt: commit.commit.author.date,
        };
      }),
      pagination: {
        page,
        perPage: COMMITS_PER_PAGE,
        hasMore: commits.length === COMMITS_PER_PAGE,
      },
    });
  } catch (error) {
    console.error(error);

    response.status(502).json({
      error: "Could not load GitHub commits",
    });
  }
});

module.exports = router;
