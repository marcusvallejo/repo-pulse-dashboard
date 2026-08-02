import { useEffect, useState } from "react";

function useRepositoryData() {
  const [isLoading, setIsLoading] = useState(true);
  const [repositoryData, setRepositoryData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    async function loadRepositoryData() {
      try {
        const response = await fetch("/data/repositories.json");

        if (!response.ok) {
          throw new Error("Could not load repository data");
        }

        const data = await response.json();
        setRepositoryData(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Using fallback data");
      } finally {
        setIsLoading(false);
      }
    }

    loadRepositoryData();
  }, []);

  return {
    repositoryData,
    isLoading,
    errorMessage,
  };
}

export default useRepositoryData;
