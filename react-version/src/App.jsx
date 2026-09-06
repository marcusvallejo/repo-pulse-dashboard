import { useEffect, useState } from "react";
import RepositorySelector from "./components/RepositorySelector";
import useRepositoryData from "./hooks/useRepositoryData";
import RefreshButton from "./components/RefreshButton";
import DashboardSections from "./components/DashboardSections";
import GithubStatus from "./components/GithubStatus";
import GithubUserProfile from "./components/GithubUserProfile";
import GithubRepositoryList from "./components/GithubRepositoryList";
import GithubRepositoryDetails from "./components/GithubRepositoryDetails";
import GithubPullRequestList from "./components/GithubPullRequestList";

function App() {
  const [selectedRepository, setSelectedRepository] = useState("shopfront");
  const [repositories, setRepositories] = useState([]);
  const { repositoryData, isLoading, errorMessage, reloadRepositoryData } =
    useRepositoryData(selectedRepository);
  const [selectedGithubRepository, setSelectedGithubRepository] = useState(null);

  useEffect(function () {
    async function loadRepositories() {
      try {
        const response = await fetch("/api/repositories");
        const data = await response.json();

        setRepositories(Object.keys(data));
      } catch (error) {
        console.error(error);
      }
    }

    loadRepositories();
  }, []);

  const metrics = repositoryData?.metrics ?? [];
  const pullRequests = repositoryData?.pullRequests ?? [];
  const activity = repositoryData?.activity ?? [];

  return (
    <main>
      <h1>RepoPulse React Version</h1>
      <p>This is where we will migrate the dashboard piece by piece.</p>
      <GithubStatus />
      <GithubUserProfile />
      <GithubRepositoryList
        selectedRepository={selectedGithubRepository}
        onRepositorySelect={setSelectedGithubRepository}
      />
      <GithubRepositoryDetails repository={selectedGithubRepository} />
      <GithubPullRequestList repository={selectedGithubRepository} />

      {isLoading && <p>Loading repository data...</p>}
      {errorMessage && <p>{errorMessage}</p>}

      <RefreshButton
        isLoading={isLoading}
        onRefresh={reloadRepositoryData}
      />

      <RepositorySelector
        repositories={repositories}
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
