import { useEffect, useState } from "react";
import fetchGithubApi from "../api/githubApi";

function useGithubUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    async function loadGithubUser() {
      try {
        const user = await fetchGithubApi("/api/github/user");
        setUser(user);
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
