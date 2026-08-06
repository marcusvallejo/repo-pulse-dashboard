import { useState } from "react";
import MetricGrid from "./components/MetricGrid";
import PullRequestList from "./components/PullRequestList";
import ActivityChart from "./components/ActivityChart";
import RepositorySelector from "./components/RepositorySelector";
import useRepositoryData from "./hooks/useRepositoryData";
import RefreshButton from "./components/RefreshButton";

function App() {
  const { repositoryData, isLoading, errorMessage, reloadRepositoryData } =
    useRepositoryData();
  const [selectedRepository, setSelectedRepository] = useState("shopfront");

  const metrics = repositoryData?.[selectedRepository]?.metrics ?? [];
  const pullRequests = repositoryData?.[selectedRepository]?.pullRequests ?? [];
  const activity = repositoryData?.[selectedRepository]?.activity ?? [];

  return (
    <main>
      <h1>RepoPulse React Version</h1>
      <p>This is where we will migrate the dashboard piece by piece.</p>

      {isLoading && <p>Loading repository data...</p>}
      {errorMessage && <p>{errorMessage}</p>}

      <RefreshButton
        isLoading={isLoading}
        onRefresh={reloadRepositoryData}
      />

      <RepositorySelector
        selectedRepository={selectedRepository}
        onRepositoryChange={setSelectedRepository}
      />

      {metrics.length > 0 && <MetricGrid metrics={metrics} />}
      {pullRequests.length > 0 && (
        <PullRequestList pullRequests={pullRequests} />
      )}
      {activity.length > 0 && <ActivityChart activity={activity} />}
    </main>
  );
}

export default App;
