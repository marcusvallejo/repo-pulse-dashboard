function getConfig() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!clientId || !clientSecret || !callbackUrl || !frontendUrl) {
    throw new Error("GitHub OAuth is not configured");
  }

  for (const value of [callbackUrl, frontendUrl]) {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.username || url.password || (url.protocol !== "https:" && !(local && url.protocol === "http:"))) {
      throw new Error("OAuth URLs must use HTTPS outside localhost");
    }
  }

  return { clientId, clientSecret, callbackUrl, frontendUrl };
}

async function exchangeCode(code, verifier) {
  const config = getConfig();
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackUrl,
      code,
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok || data.error || typeof data.access_token !== "string" || !data.access_token) {
    throw new Error("GitHub token exchange failed");
  }

  return data;
}

async function getUser(accessToken) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error("GitHub identity check failed");
  }
  const user = await response.json();
  if (!Number.isInteger(user.id) || typeof user.login !== "string") {
    throw new Error("GitHub returned an invalid user");
  }
  return { id: user.id, login: user.login, name: user.name || user.login };
}

module.exports = { getConfig, exchangeCode, getUser };
