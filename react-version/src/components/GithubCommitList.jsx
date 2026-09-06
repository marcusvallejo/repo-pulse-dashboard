import useGithubCommits from "../hooks/useGithubCommits";

function GithubCommitList({ repository }) {
  const {
    commits,
    hasMore,
    isLoading,
    errorMessage,
    loadMoreCommits,
  } = useGithubCommits(repository);

  if (!repository) {
    return null;
  }

  if (isLoading && commits.length === 0) {
    return <p>Loading commits...</p>;
  }

  if (errorMessage && commits.length === 0) {
    return <p>{errorMessage}</p>;
  }

  return (
    <section>
      <h2>Recent commits</h2>

      {commits.length === 0 ? (
        <p>No commits found.</p>
      ) : (
        <>
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

          {errorMessage && <p>{errorMessage}</p>}

          {hasMore && (
            <button
              type="button"
              onClick={loadMoreCommits}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load more commits"}
            </button>
          )}
        </>
      )}
    </section>
  );
}

export default GithubCommitList;
