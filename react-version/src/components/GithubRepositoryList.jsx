import useGithubRepositories from "../hooks/useGithubRepositories";

function GithubRepositoryList() {
  const { repositories, isLoading, errorMessage } = useGithubRepositories();

  if (isLoading) {
    return <p>Loading GitHub repositories...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <section>
      <h2>GitHub repositories</h2>

      <ul>
        {repositories.map((repository) => (
          <li key={repository.id}>
            <a href={repository.url}>{repository.fullName}</a>
            {repository.private ? " private" : " public"}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default GithubRepositoryList;
