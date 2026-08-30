function hasGithubToken() {
  return Boolean(process.env.GITHUB_TOKEN);
}

module.exports = {
  hasGithubToken,
};