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

function calculateHealthScore(analytics) {
  let score = 100;

  const stalePullRequestPenalty = Math.min(
    analytics.stalePullRequests * 5,
    30
  );

  score -= stalePullRequestPenalty;

  if (analytics.averageMergeTimeDays !== null) {
    if (analytics.averageMergeTimeDays > 7) {
      score -= 20;
    } else if (analytics.averageMergeTimeDays > 3) {
      score -= 10;
    }
  }

  if (analytics.commitsLast30Days === 0) {
    score -= 20;
  } else if (analytics.commitsLast30Days < 5) {
    score -= 10;
  }

  if (analytics.openPullRequests > 20) {
    score -= 10;
  }

  return Math.max(score, 0);
}

function buildRecommendations(analytics) {
  const recommendations = [];

  if (analytics.stalePullRequests > 0) {
    const pullRequestText =
      analytics.stalePullRequests === 1
        ? "pull request has"
        : "pull requests have";

    recommendations.push({
      priority: "high",
      title: "Review stale pull requests",
      message: `${analytics.stalePullRequests} ${pullRequestText} been open longer than ${analytics.staleAfterDays} days.`,
    });
  }

  if (
    analytics.averageMergeTimeDays !== null &&
    analytics.averageMergeTimeDays > 3
  ) {
    const priority =
      analytics.averageMergeTimeDays > 7 ? "high" : "medium";

    recommendations.push({
      priority,
      title: "Reduce pull request merge time",
      message: `Pull requests take an average of ${analytics.averageMergeTimeDays} days to merge.`,
    });
  }

  if (analytics.commitsLast30Days === 0) {
    recommendations.push({
      priority: "high",
      title: "Increase repository activity",
      message: `No commits were made during the last ${analytics.windowDays} days.`,
    });
  } else if (analytics.commitsLast30Days < 5) {
    const commitText =
      analytics.commitsLast30Days === 1 ? "commit was" : "commits were";

    recommendations.push({
      priority: "medium",
      title: "Increase repository activity",
      message: `Only ${analytics.commitsLast30Days} ${commitText} made during the last ${analytics.windowDays} days.`,
    });
  }

  if (analytics.openPullRequests > 20) {
    recommendations.push({
      priority: "medium",
      title: "Reduce the pull request backlog",
      message: `${analytics.openPullRequests} pull requests are currently open.`,
    });
  }

  return recommendations;
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

  const analytics = {
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

  return {
    ...analytics,
    healthScore: calculateHealthScore(analytics),
    recommendations: buildRecommendations(analytics),
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
  buildRecommendations,
  calculateHealthScore,
  getRepositoryAnalytics,
};
