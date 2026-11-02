async function fetchGithubApi(path) {
  const response = await fetch(path);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event("repopulse:unauthorized"));
    }
    throw new Error(data.error || "GitHub request failed");
  }

  return data;
}

export default fetchGithubApi;
