import MetricGrid from "./MetricGrid";
import PullRequestList from "./PullRequestList";
import ActivityChart from "./ActivityChart";

function DashboardSections({ metrics, pullRequests, activity }) {
  const hasDashboardData = 
    metrics.length > 0 ||
    pullRequests.length > 0 ||
    activity.length > 0;

  if (!hasDashboardData) {
    return <p>No repository data loaded yet.</p>;
  }
  
  return (
    <section>
      {metrics.length > 0 && <MetricGrid metrics={metrics} />}
      {pullRequests.length > 0 && (
        <PullRequestList pullRequests={pullRequests} />
      )}
      {activity.length > 0 && <ActivityChart activity={activity} />}
    </section>
  );
}

export default DashboardSections;
