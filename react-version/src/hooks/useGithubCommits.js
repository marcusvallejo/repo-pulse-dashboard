import { useEffect, useState } from "react";
import fetchGithubApi from "../api/githubApi";

async function fetchGithubCommits(repository, page) {
  const [owner, repo] = repository.fullName.split("/");

  return fetchGithubApi(
    `/api/github/repositories/${owner}/${repo}/commits?page=${page}`
  );
}

function useGithubCommits(repository) {
  const [commits, setCommits] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(Boolean(repository));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(function () {
    if (!repository) {
      return;
    }

    let ignoreResponse = false;

    async function loadInitialCommits() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await fetchGithubCommits(repository, 1);

        if (ignoreResponse) {
          return;
        }

        setCommits(data.commits);
        setPage(data.pagination.page);
        setHasMore(data.pagination.hasMore);
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

    loadInitialCommits();

    return function () {
      ignoreResponse = true;
    };
  }, [repository]);

  async function loadMoreCommits() {
    if (!repository || isLoading || !hasMore) {
      return;
    }

    const nextPage = page + 1;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await fetchGithubCommits(repository, nextPage);

      setCommits((currentCommits) => [
        ...currentCommits,
        ...data.commits,
      ]);
      setPage(data.pagination.page);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    commits,
    hasMore,
    isLoading,
    errorMessage,
    loadMoreCommits,
  };
}

export default useGithubCommits;
