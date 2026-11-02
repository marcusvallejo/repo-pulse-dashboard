function checkResponse(response, message) {
  if (!response.ok) {
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
}

async function getAuthenticatedUser(accessToken) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  checkResponse(response, "Could not load GitHub user");

  return response.json();
}

async function getRepositories(accessToken) {
  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  checkResponse(response, "Could not load GitHub repositories");

  return response.json();
}

async function getPullRequests(accessToken, owner, repo, state, perPage) {
  const query =
    state && perPage ? `?state=${state}&per_page=${perPage}` : "";

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls${query}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  checkResponse(response, "Could not load GitHub pull requests");

  return response.json();
}

async function getCommits(accessToken, owner, repo, page, perPage, since) {
  const sinceQuery = since ? `&since=${encodeURIComponent(since)}` : "";

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}${sinceQuery}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  checkResponse(response, "Could not load GitHub commits");

  return response.json();
}

module.exports = {
  getAuthenticatedUser,
  getRepositories,
  getPullRequests,
  getCommits,
};
