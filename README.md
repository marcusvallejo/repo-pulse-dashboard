# RepoPulse

RepoPulse is a GitHub code review and repository analytics dashboard. It brings pull request activity, commit trends, code-quality signals, and prioritized recommendations into one focused interface.

## Features

- GitHub profile and repository discovery
- Live pull request and paginated commit data
- 30-day repository activity metrics
- Rule-based repository health score
- Prioritized workflow recommendations
- Automated API and analytics tests

## Current Status

RepoPulse has a React frontend and an Express backend connected to the GitHub REST API. It currently loads live repository data, calculates review and activity metrics, and generates health recommendations. GitHub OAuth, historical snapshots, deployment, and the final dashboard design remain in development.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/marcusvallejo/repo-pulse-dashboard.git
cd repo-pulse-dashboard
```

The original static prototype can still be opened with `index.html`.

Create `server/.env` from `server/.env.example` and add a GitHub token. Keep this file private.

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

## Verification

With the backend running, run its smoke test from the `server` directory:

```bash
npm run smoke-test
```

## Roadmap

- GitHub OAuth authentication
- Historical repository snapshots
- Frontend component tests
- Final responsive dashboard design
- Production deployment and CI

## License

This project is licensed under the terms in [LICENSE](LICENSE).
