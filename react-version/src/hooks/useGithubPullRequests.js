import { useEffect, useState } from "react";
import fetchGithubApi from "../api/githubApi";

function useGithubPullRequests(repository) {
  const [pullRequests, setPullRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    if (!repository) {
      return;
    }

    async function loadPullRequests() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [owner, repo] = repository.fullName.split("/");
        const data = await fetchGithubApi(
          `/api/github/repositories/${owner}/${repo}/pulls`
        );

        setPullRequests(data);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPullRequests();
  }, [repository]);

  return {
    pullRequests,
    isLoading,
    errorMessage,
  };
}

export default useGithubPullRequests;