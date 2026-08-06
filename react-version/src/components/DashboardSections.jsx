import MetricGrid from "./MetricGrid";
import PullRequestList from "./PullRequestList";
import ActivityChart from "./ActivityChart";

function DashboardSections({ metrics, pullRequests, activity }) {
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
