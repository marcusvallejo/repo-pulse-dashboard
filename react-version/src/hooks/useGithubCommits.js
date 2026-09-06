import { useEffect, useState } from "react";
import fetchGithubApi from "../api/githubApi";

function useGithubCommits(repository) {
  const [commits, setCommits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    if (!repository) {
      return;
    }

    async function loadCommits() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [owner, repo] = repository.fullName.split("/");
        const data = await fetchGithubApi(
          `/api/github/repositories/${owner}/${repo}/commits`
        );

        setCommits(data);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadCommits();
  }, [repository]);

  return {
    commits,
    isLoading,
    errorMessage,
  };
}

export default useGithubCommits;
