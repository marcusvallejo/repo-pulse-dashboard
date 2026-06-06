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

RepoPulse is currently a frontend prototype powered by representative sample data. GitHub authentication and live repository analytics are planned for a future release.

## Run Locally

Clone the repository and open `index.html` in a browser:

```bash
git clone https://github.com/marcusvallejo/repo-pulse-dashboard.git
cd repo-pulse-dashboard
```

No dependencies or build step are required.

## Verification

Run the lightweight rendering check with Node.js:

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
