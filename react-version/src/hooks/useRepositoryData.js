import { useEffect, useState } from "react";

const REPOSITORY_DATA_URL = "/api/repositories";

async function fetchRepositoryData() {
  const response = await fetch(REPOSITORY_DATA_URL);

  if (!response.ok) {
    throw new Error("Could not load repository data");
  }

  return response.json();
}

function useRepositoryData() {
  const [isLoading, setIsLoading] = useState(true);
  const [repositoryData, setRepositoryData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadRepositoryData() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await fetchRepositoryData();
      setRepositoryData(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Using fallback data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(function () {
    async function loadInitialRepositoryData() {
      try {
        const data = await fetchRepositoryData();
        setRepositoryData(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Using fallback data");
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialRepositoryData();
  }, []);

  return {
    repositoryData,
    isLoading,
    errorMessage,
    reloadRepositoryData: loadRepositoryData,
  };
}

export default useRepositoryData;
