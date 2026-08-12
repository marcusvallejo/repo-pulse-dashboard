import { useCallback, useEffect, useState } from "react";

const REPOSITORY_DATA_URL = "/api/repositories";

async function fetchRepositoryData(repositoryId) {
  const response = await fetch(`${REPOSITORY_DATA_URL}/${repositoryId}`);

  if (!response.ok) {
    throw new Error("Could not load repository data");
  }

  return response.json();
}

function useRepositoryData(selectedRepository) {
  const [isLoading, setIsLoading] = useState(true);
  const [repositoryData, setRepositoryData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRepositoryData = useCallback(async function () {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setRepositoryData(null);

      const data = await fetchRepositoryData(selectedRepository);
      setRepositoryData(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Using fallback data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepository]);

  useEffect(function () {
    loadRepositoryData();
  }, [loadRepositoryData]);

  return {
    repositoryData,
    isLoading,
    errorMessage,
    reloadRepositoryData: loadRepositoryData,
  };
}

export default useRepositoryData;
