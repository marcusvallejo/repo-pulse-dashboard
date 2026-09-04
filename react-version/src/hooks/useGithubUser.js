import { useEffect, useState } from "react";

function useGithubUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    async function loadGithubUser() {
      try {
        const response = await fetch("/api/github/user");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setUser(data);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadGithubUser();
  }, []);

  return {
    user,
    isLoading,
    errorMessage,
  };
}

export default useGithubUser;
