import { useState } from "react";
import useAuthSession from "./hooks/useAuthSession";
import GithubUserProfile from "./components/GithubUserProfile";
import GithubRepositoryList from "./components/GithubRepositoryList";
import GithubRepositoryDetails from "./components/GithubRepositoryDetails";
import GithubPullRequestList from "./components/GithubPullRequestList";
import GithubCommitList from "./components/GithubCommitList";
import GithubAnalyticsSummary from "./components/GithubAnalyticsSummary";

function RepositoryDashboard() {
  const [selectedGithubRepository, setSelectedGithubRepository] = useState(null);

  return (
    <>
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
    </>
  );
}

function App() {
  const { user, isLoading, isSigningOut, errorMessage, signOut } = useAuthSession();

  return (
    <main>
      <h1>RepoPulse</h1>
      <p>Live GitHub code review and repository analytics.</p>
      {isLoading ? (
        <p role="status">Checking your GitHub login...</p>
      ) : user ? (
        <>
          <p>Signed in as {user.login}</p>
          <button type="button" onClick={signOut} disabled={isSigningOut}>
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
          <RepositoryDashboard key={user.id} />
        </>
      ) : (
        <a href="/api/auth/github">Connect GitHub</a>
      )}
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </main>
  );
}

export default App;
