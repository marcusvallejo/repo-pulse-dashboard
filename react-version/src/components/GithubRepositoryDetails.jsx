function GithubRepositoryDetails({ repository }) {
  if (!repository) {
    return null;
  }

  return (
    <section>
      <h2>Selected GitHub repository</h2>

      <p>Name: {repository.fullName}</p>
      <p>Visibility: {repository.private ? "private" : "public"}</p>

      <p>
        GitHub URL:{" "}
        <a href={repository.url} target="_blank" rel="noreferrer">
          {repository.url}
        </a>
      </p>
    </section>
  );
}

export default GithubRepositoryDetails;
