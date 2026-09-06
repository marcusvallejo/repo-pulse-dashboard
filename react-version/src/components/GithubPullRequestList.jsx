import useGithubPullRequests from "../hooks/useGithubPullRequests";

function GithubPullRequestList({ repository }) {
  const { pullRequests, isLoading, errorMessage } =
    useGithubPullRequests(repository);

  if (!repository) {
    return null;
  }

  if (isLoading) {
    return <p>Loading pull requests...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <section>
      <h2>Open pull requests</h2>

      {pullRequests.length === 0 ? (
        <p>No open pull requests found.</p>
      ) : (
        <ul>
          {pullRequests.map((pullRequest) => (
            <li key={pullRequest.id}>
              <a href={pullRequest.url} target="_blank" rel="noreferrer">
                #{pullRequest.number} {pullRequest.title}
              </a>
              <p>
                Opened by {pullRequest.author} on {pullRequest.createdAt}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default GithubPullRequestList;
