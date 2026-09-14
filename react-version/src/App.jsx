import { useState } from "react";
import GithubStatus from "./components/GithubStatus";
import GithubUserProfile from "./components/GithubUserProfile";
import GithubRepositoryList from "./components/GithubRepositoryList";
import GithubRepositoryDetails from "./components/GithubRepositoryDetails";
import GithubPullRequestList from "./components/GithubPullRequestList";
import GithubCommitList from "./components/GithubCommitList";
import GithubAnalyticsSummary from "./components/GithubAnalyticsSummary";

function App() {
  const [selectedGithubRepository, setSelectedGithubRepository] = useState(null);

  return (
    <main>
      <h1>RepoPulse</h1>
      <p>Live GitHub code review and repository analytics.</p>
      <GithubStatus />
      <GithubUserProfile />
      <GithubRepositoryList
        onRepositorySelect={setSelectedGithubRepository}
      />
      {!selectedGithubRepository && (
        <p>Select a GitHub repository to view its analytics.</p>
      )}
      <GithubRepositoryDetails repository={selectedGithubRepository} />
      <GithubAnalyticsSummary
        key={`analytics-${selectedGithubRepository?.id ?? "none"}`}
        repository={selectedGithubRepository}
      />
      <GithubPullRequestList repository={selectedGithubRepository} />
      <GithubCommitList
        key={selectedGithubRepository?.id ?? "no-repository"}
        repository={selectedGithubRepository}
      />
    </main>
  );
}

export default App;
