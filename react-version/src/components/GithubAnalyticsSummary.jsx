import useGithubAnalytics from "../hooks/useGithubAnalytics";
import MetricGrid from "./MetricGrid";
import GithubRecommendations from "./GithubRecommendations";

function GithubAnalyticsSummary({ repository }) {
  const { analytics, isLoading, errorMessage } =
    useGithubAnalytics(repository);

  if (!repository) {
    return null;
  }

  if (isLoading) {
    return <p>Calculating repository analytics...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!analytics) {
    return null;
  }

  const averageMergeTime =
    analytics.averageMergeTimeDays === null
      ? "N/A"
      : `${analytics.averageMergeTimeDays}d`;

  const metrics = [
    {
      label: "Open PRs",
      value: analytics.openPullRequests,
      note: `${analytics.stalePullRequests} waiting over ${analytics.staleAfterDays} days`,
    },
    {
      label: "Average merge time",
      value: averageMergeTime,
      note: `Merged during the last ${analytics.windowDays} days`,
    },
    {
      label: "Commits",
      value: analytics.commitsLast30Days,
      note: `During the last ${analytics.windowDays} days`,
    },
    {
      label: "Health score",
      value: analytics.healthScore,
      note: "Out of 100",
    },
  ];

  return (
    <div>
      <h2>Live repository analytics</h2>
      <MetricGrid metrics={metrics} />
      <GithubRecommendations
        recommendations={analytics.recommendations}
      />
    </div>
  );
}

export default GithubAnalyticsSummary;
