import { useEffect, useState } from "react";

const REPOSITORY_DATA_URL = "/api/repositories";

async function fetchRepositoryData(repositoryId) {
  const response = await fetch(`${REPOSITORY_DATA_URL}/${repositoryId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}

function useRepositoryData(selectedRepository) {
  const [isLoading, setIsLoading] = useState(true);
  const [repositoryData, setRepositoryData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(
    function () {
      async function loadRepositoryData() {
        try {
          setIsLoading(true);
          setErrorMessage("");
          setRepositoryData(null);

          const data = await fetchRepositoryData(selectedRepository);
          setRepositoryData(data);
        } catch (error) {
          console.error(error);
          setErrorMessage(error.message);
        } finally {
          setIsLoading(false);
        }
      }

      loadRepositoryData();
    },
    [selectedRepository, refreshCount]
  );

  function reloadRepositoryData() {
    setRefreshCount((currentCount) => currentCount + 1);
  }

  return {
    repositoryData,
    isLoading,
    errorMessage,
    reloadRepositoryData,
  };
}

export default useRepositoryData;
