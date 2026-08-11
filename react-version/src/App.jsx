import { useState } from "react";
import RepositorySelector from "./components/RepositorySelector";
import useRepositoryData from "./hooks/useRepositoryData";
import RefreshButton from "./components/RefreshButton";
import DashboardSections from "./components/DashboardSections";

function App() {
  const [selectedRepository, setSelectedRepository] = useState("shopfront");
  const { repositoryData, isLoading, errorMessage, reloadRepositoryData } =
    useRepositoryData(selectedRepository);

  const metrics = repositoryData?.metrics ?? [];
  const pullRequests = repositoryData?.pullRequests ?? [];
  const activity = repositoryData?.activity ?? [];

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

      <DashboardSections
        metrics={metrics}
        pullRequests={pullRequests}
        activity={activity}
      />
    </main>
  );
}

export default App;
