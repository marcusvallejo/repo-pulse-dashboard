# RepoPulse

RepoPulse is a GitHub code review and repository analytics dashboard. It brings pull request activity, commit trends, code-quality signals, and prioritized recommendations into one focused interface.

## Features

- GitHub profile and repository discovery
- GitHub OAuth login, per-user dashboard sessions, and sign-out
- Live pull request and paginated commit data
- 30-day repository activity metrics
- Daily commit-activity chart with UTC dates and accessible daily counts
- Rule-based repository health score
- Prioritized workflow recommendations
- Automated API and analytics tests

## Current Status

RepoPulse has a React frontend and an Express backend connected to the GitHub REST API. Visitors sign in with GitHub to load repository data using their own session. The app calculates review and activity metrics and generates health recommendations. Historical snapshots, production deployment, and the final dashboard design remain in development.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/marcusvallejo/repo-pulse-dashboard.git
cd repo-pulse-dashboard
```

The original static prototype can still be opened with `index.html`.

Create `server/.env` from `server/.env.example` and add your OAuth App's client ID and secret. Keep this file private. A personal `GITHUB_TOKEN` is no longer used.

## Backend API

The Express backend lives in `server`.

### Run the backend

```powershell
cd server
npm install
npm run dev
```

### Test the backend

```powershell
npm test
npm run smoke-test
```

### API routes

- `GET /`
- `GET /api/health`
- `GET /api/github/status`
- `GET /api/github/user`
- `GET /api/github/repositories`
- `GET /api/github/repositories/:owner/:repo/pulls`
- `GET /api/github/repositories/:owner/:repo/commits?page=1`
- `GET /api/github/repositories/:owner/:repo/analytics`

## React Frontend

Run the Vite frontend in a second terminal:

```powershell
cd react-version
npm install
npm run dev
```

The development server runs at `http://localhost:5173` and proxies API requests to the Express server on port `4000`.

## Local OAuth Login

Register a GitHub OAuth App with homepage `http://localhost:5173` and callback
`http://localhost:4000/api/auth/github/callback`. Add `GITHUB_CLIENT_ID`,
`GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, and `FRONTEND_URL` to `server/.env`
using `server/.env.example` as a reference. Restart the backend after environment changes.

- Open `http://localhost:5173` and select **Connect GitHub** to start login.
- GitHub returns to `GET /api/auth/github/callback`; successful login redirects to React.
- Open `http://localhost:4000/api/auth/session` in the same browser to inspect login status.
- `POST /api/auth/logout` clears the local session and requires a RepoPulse Origin header.

The backend validates OAuth state and PKCE and stores tokens in a server-side
session. The browser receives an HttpOnly session-ID cookie, not a GitHub token.
This step requests basic public access without the broad `repo` scope.
Sessions end after at most eight hours, or sooner if the access token expires.
Sign in again after expiry; automatic refresh is not implemented yet.

This is local development only: sessions are stored in memory and are lost on
restart. `SESSION_SECRET` is optional locally (a random startup secret is used
otherwise). Production startup is blocked until a persistent session store and
HTTPS deployment configuration are added.

React checks `/api/auth/session` before mounting the dashboard. All GitHub data
routes require the visitor's session and pass that visitor's token to GitHub.
There is no fallback to an environment token. Sign-out removes the dashboard and
its selected repository. Expired or revoked sessions return to the login view.
The read-only `/api/github/status` endpoint reports `authenticated`, not whether
an environment token is configured. To test isolation, open an incognito window:
it must show Connect GitHub rather than the first browser's repositories.

## Verification

With the backend running, run its smoke test from the `server` directory:

```bash
npm run smoke-test
```

## Analytics Scope

Commit activity covers 30 UTC calendar days including today, on the default branch.
Analytics currently fetch up to 100 commits. A notice appears when that limit is
reached because earlier activity may be missing.

## Roadmap

- Persistent production sessions and automatic OAuth token refresh
- Historical repository snapshots
- Frontend component tests
- Final responsive dashboard design
- Production deployment and CI

## License

This project is licensed under the terms in [LICENSE](LICENSE).
