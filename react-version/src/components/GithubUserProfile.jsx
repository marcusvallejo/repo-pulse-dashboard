import useGithubUser from "../hooks/useGithubUser";

function GithubUserProfile() {
  const { user, isLoading, errorMessage } = useGithubUser();

  if (isLoading) {
    return <p>Loading GitHub user...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <section>
      <h2>GitHub user</h2>

      {user.avatarUrl && (
        <img
          src={user.avatarUrl}
          alt={`${user.login} avatar`}
          width="72"
          height="72"
        />
      )}

      <p>
        Connected as{" "}
        <a href={user.profileUrl} target="_blank" rel="noreferrer">
          {user.name || user.login}
        </a>
      </p>

      <p>{user.publicRepos} public repositories</p>
    </section>
  );
}

export default GithubUserProfile;
