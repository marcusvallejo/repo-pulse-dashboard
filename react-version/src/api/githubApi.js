async function fetchGithubApi(path) {
  const response = await fetch(path);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "GitHub request failed");
  }

  return data;
}

export default fetchGithubApi;
