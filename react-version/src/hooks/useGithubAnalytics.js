import { useEffect, useState } from "react";
import fetchGithubApi from "../api/githubApi";

function useGithubAnalytics(repository) {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(repository));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    if (!repository) {
      return;
    }

    let ignoreResponse = false;

    async function loadAnalytics() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [owner, repo] = repository.fullName.split("/");
        const data = await fetchGithubApi(
          `/api/github/repositories/${owner}/${repo}/analytics`
        );

        if (!ignoreResponse) {
          setAnalytics(data);
        }
      } catch (error) {
        if (!ignoreResponse) {
          console.error(error);
          setErrorMessage(error.message);
        }
      } finally {
        if (!ignoreResponse) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();

    return function () {
      ignoreResponse = true;
    };
  }, [repository]);

  return {
    analytics,
    isLoading,
    errorMessage,
  };
}

export default useGithubAnalytics;
