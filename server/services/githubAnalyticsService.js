const githubService = require("./githubService");

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ANALYTICS_WINDOW_DAYS = 30;
const STALE_PULL_REQUEST_DAYS = 7;
const ANALYTICS_PAGE_SIZE = 100;

function getAverageMergeTimeDays(pullRequests, windowStart) {
  const recentlyMergedPullRequests = pullRequests.filter(function (pullRequest) {
    return (
      pullRequest.merged_at &&
      new Date(pullRequest.merged_at) >= windowStart
    );
  });

  if (recentlyMergedPullRequests.length === 0) {
    return null;
  }

  const totalMergeTimeDays = recentlyMergedPullRequests.reduce(
    function (total, pullRequest) {
      const createdAt = new Date(pullRequest.created_at);
      const mergedAt = new Date(pullRequest.merged_at);

      return total + (mergedAt - createdAt) / DAY_IN_MS;
    },
    0
  );

  const average = totalMergeTimeDays / recentlyMergedPullRequests.length;

  return Math.round(average * 10) / 10;
}

function buildRepositoryAnalytics(
  openPullRequests,
  closedPullRequests,
  commits,
  currentDate = new Date()
) {
  const windowStart = new Date(
    currentDate.getTime() - ANALYTICS_WINDOW_DAYS * DAY_IN_MS
  );
  const staleThreshold = new Date(
    currentDate.getTime() - STALE_PULL_REQUEST_DAYS * DAY_IN_MS
  );

  const stalePullRequests = openPullRequests.filter(function (pullRequest) {
    return new Date(pullRequest.created_at) < staleThreshold;
  });

  return {
    openPullRequests: openPullRequests.length,
    stalePullRequests: stalePullRequests.length,
    commitsLast30Days: commits.length,
    averageMergeTimeDays: getAverageMergeTimeDays(
      closedPullRequests,
      windowStart
    ),
    windowDays: ANALYTICS_WINDOW_DAYS,
    staleAfterDays: STALE_PULL_REQUEST_DAYS,
  };
}

async function getRepositoryAnalytics(owner, repo) {
  const currentDate = new Date();
  const windowStart = new Date(
    currentDate.getTime() - ANALYTICS_WINDOW_DAYS * DAY_IN_MS
  );

  const [openPullRequests, closedPullRequests, commits] = await Promise.all([
    githubService.getPullRequests(
      owner,
      repo,
      "open",
      ANALYTICS_PAGE_SIZE
    ),
    githubService.getPullRequests(
      owner,
      repo,
      "closed",
      ANALYTICS_PAGE_SIZE
    ),
    githubService.getCommits(
      owner,
      repo,
      1,
      ANALYTICS_PAGE_SIZE,
      windowStart.toISOString()
    ),
  ]);

  return buildRepositoryAnalytics(
    openPullRequests,
    closedPullRequests,
    commits,
    currentDate
  );
}

module.exports = {
  buildRepositoryAnalytics,
  getRepositoryAnalytics,
};
