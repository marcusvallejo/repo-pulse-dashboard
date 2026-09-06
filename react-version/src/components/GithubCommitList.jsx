import useGithubCommits from "../hooks/useGithubCommits";

function GithubCommitList({ repository }) {
  const { commits, isLoading, errorMessage } = useGithubCommits(repository);

  if (!repository) {
    return null;
  }

  if (isLoading) {
    return <p>Loading commits...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <section>
      <h2>Recent commits</h2>

      {commits.length === 0 ? (
        <p>No commits found.</p>
      ) : (
        <ul>
          {commits.map((commit) => (
            <li key={commit.sha}>
              <a href={commit.url} target="_blank" rel="noreferrer">
                {commit.message}
              </a>
              <p>
                Committed by {commit.author} on {commit.createdAt}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default GithubCommitList;
