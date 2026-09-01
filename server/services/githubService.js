function hasGithubToken() {
  return Boolean(process.env.GITHUB_TOKEN);
}

async function getAuthenticatedUser() {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error("Could not load GitHub user");
  }

  return response.json();
}

module.exports = {
  hasGithubToken,
  getAuthenticatedUser,
};
