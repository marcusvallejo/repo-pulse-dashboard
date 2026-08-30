# RepoPulse

RepoPulse is a GitHub code review and repository analytics dashboard. It brings pull request activity, commit trends, code-quality signals, and prioritized recommendations into one focused interface.

## Features

- Repository health overview
- Pull request risk and review-status signals
- Commit activity visualization
- Code-quality indicators
- Prioritized improvement recommendations
- Responsive dark editorial interface

## Current Status

RepoPulse currently has a React frontend and an Express backend powered by representative sample repository data. GitHub authentication and live repository analytics are planned for a future release.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/marcusvallejo/repo-pulse-dashboard.git
cd repo-pulse-dashboard
```

The original static prototype can still be opened with `index.html`.

## Backend API

The Express backend lives in `server`.

### Run the backend

```powershell
cd server
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
- `GET /api/repositories`
- `GET /api/repositories/:repositoryId`
- `GET /api/repositories/:repositoryId/summary`

## Verification

Run the static prototype smoke test from the project root:

```bash
node scripts/smoke-test.js
```

## Roadmap

- GitHub OAuth authentication
- Repository selection
- Live pull request and commit data
- Historical repository snapshots
- Rule-based health recommendations

## License

This project is licensed under the terms in [LICENSE](LICENSE).
