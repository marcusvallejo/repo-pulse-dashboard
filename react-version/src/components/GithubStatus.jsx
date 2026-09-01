import useGithubStatus from "../hooks/useGithubStatus";

function GithubStatus() {
  const { isLoading, isConfigured, errorMessage } = useGithubStatus();

  if (isLoading) {
    return <p>Checking GitHub connection...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <p>
      GitHub {isConfigured ? "connected" : "not connected"}
    </p>
  );
}

export default GithubStatus;
