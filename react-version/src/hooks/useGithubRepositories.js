import { useEffect, useState } from "react";

function useGithubRepositories() {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    async function loadGithubRepositories() {
      try {
        const response = await fetch("/api/github/repositories");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setRepositories(data);
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
