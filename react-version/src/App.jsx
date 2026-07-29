import { useEffect, useState } from "react";
import MetricGrid from "./components/MetricGrid";
import PullRequestList from "./components/PullRequestList";
import ActivityChart from "./components/ActivityChart";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedRepository, setSelectedRepository] = useState("shopfront");
  const [repositoryData, setRepositoryData] = useState(null);

  useEffect(function () {
    async function loadRepositoryData() {
      try {
        const response = await fetch("/data/repositories.json");

        if (!response.ok) {
          throw new Error("Could not load repository data");
        }

        const data = await response.json();
        setRepositoryData(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Using fallback data");
      } finally {
        setIsLoading(false);
      }
    }

    loadRepositoryData();
  }, []);

  const metrics = repositoryData?.[selectedRepository]?.metrics ?? [];
  const pullRequests = repositoryData?.[selectedRepository]?.pullRequests ?? [];
  const activity = repositoryData?.[selectedRepository]?.activity ?? [];

  return (
    <main>
      <h1>RepoPulse React Version</h1>
      <p>This is where we will migrate the dashboard piece by piece.</p>

      {isLoading && <p>Loading repository data...</p>}
      {errorMessage && <p>{errorMessage}</p>}

      <select
        value={selectedRepository}
        onChange={(event) => setSelectedRepository(event.target.value)}
      >
        <option value="shopfront">open-source/shopfront</option>
        <option value="api-service">open-source/api-service</option>
        <option value="mobile-app">open-source/mobile-app</option>
      </select>

      {metrics.length > 0 && <MetricGrid metrics={metrics} />}
      {pullRequests.length > 0 && (
        <PullRequestList pullRequests={pullRequests} />
      )}
      {activity.length > 0 && <ActivityChart activity={activity} />}
    </main>
  );
}

export default App;
