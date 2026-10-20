# RepoPulse

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual developers are the primary audience. They review their GitHub repositories to understand recent activity, pull request delays, and work needing attention. Small development teams are a later audience.

## Product Purpose

Bring GitHub code review and repository activity into one dashboard so developers can identify review bottlenecks and decide what to address next.

The project also supports the author's learning of React and Express and is intended to become a portfolio-quality full-stack application. Changes should remain understandable and suitable for teaching.

## Operating Context

The current workflow loads the GitHub profile and repository list through an Express API. The developer selects a repository in React to view its details, analytics, recommendations, pull requests, and paginated commit history.

Local development uses the Vite frontend on port 5173 and the Express backend on port 4000. Vite proxies /api requests to Express.

## Capabilities and Constraints

- The active app is in react-version/ and server/, using React, Vite, Node.js, and Express.
- The backend connects to the GitHub REST API using a server-side token. It does not yet support separate user logins through OAuth.
- Live features include profile and repository discovery, pull requests, paginated commit history, 30-day activity metrics, a daily commit-activity chart, a rule-based health score, and prioritized recommendations.
- Commit activity uses 30 UTC calendar days including today and the default branch. It includes zero-commit days, a daily data table, and a notice when the 100-commit fetch limit may hide earlier activity.
- The health score reflects review and activity signals. It is not a direct measurement of source-code correctness, security, or maintainability.
- Current analytics fetch limited GitHub result sets; the dashboard must not present sampled counts as guaranteed exhaustive totals.
- Credentials stay on the backend and must not appear in frontend code or documentation.
- OAuth, database persistence, historical snapshots, frontend tests, production deployment, and the final responsive dashboard remain planned work.
- Preserve existing application behavior when making visual changes unless the requested feature requires a behavior change.

## Brand Commitments

The product name is RepoPulse. The user has requested a dark theme. The earlier static prototype is a design reference; the React interface has intentionally remained a functional learning scaffold while live features are built.

## Evidence on Hand

- README.md records setup instructions, implemented features, API routes, and the roadmap.
- react-version/src/ contains the active frontend components, hooks, and API client.
- server/services/ and server/routes/ contain GitHub integration and analytics logic.
- server/tests/ contains automated tests for services, routes, and analytics.
- Root index.html, styles.css, app.js, and data/ preserve the original static prototype, whose sample content is not evidence of actual repository performance.
- No confirmed customer adoption, measured productivity gains, or benchmark results have been supplied. Do not invent these claims.

## Product Principles

- Make it easy to identify repository work that needs attention.
- Ground metrics and recommendations in real GitHub data and explain their limits.
- Prioritize individual developer workflows while leaving room for small teams later.
- Keep loading, empty, and error states understandable.
- Deliver changes in teachable increments that the author can explain and maintain.

## Open Decisions

- A distinctive competitive positioning has not been established.
- Production hosting, database selection, and the final authentication approach remain undecided.
- The final visual system has not been defined by this initialization.
