import { useEffect, useState } from "react";
import fetchGithubApi from "../api/githubApi";

function useGithubRepositories() {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    async function loadGithubRepositories() {
      try {
        const repositories = await fetchGithubApi("/api/github/repositories");
        setRepositories(repositories);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadGithubRepositories();
  }, []);

  return {
    repositories,
    isLoading,
    errorMessage,
  };
}

export default useGithubRepositories;
