import { useEffect, useState } from "react";

function useGithubStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    async function loadGithubStatus() {
      try {
        const response = await fetch("/api/github/status");
        const data = await response.json();

        setIsConfigured(data.configured);
      } catch (error) {
        console.error(error);
        setErrorMessage("GitHub status unavailable");
      } finally {
        setIsLoading(false);
      }
    }

    loadGithubStatus();
  }, []);

  return {
    isLoading,
    isConfigured,
    errorMessage,
  };
}

export default useGithubStatus;
