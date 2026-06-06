const metrics = [
  { label: "Open PRs", value: "18", note: "5 waiting on review" },
  { label: "Avg merge time", value: "2.8d", note: "Down 14% this month" },
  { label: "Commits", value: "146", note: "Last 30 days" },
  { label: "Health score", value: "82", note: "Strong, with review risk" },
];

const pullRequests = [
  {
    title: "Refactor checkout payment flow",
    meta: "Open 9 days, 684 lines changed",
    risk: "high",
    summary: "Large customer-facing change has waited several days for review.",
  },
  {
    title: "Add inventory sync job",
    meta: "Open 3 days, 212 lines changed",
    risk: "medium",
    summary: "Touches background jobs and data mapping, so it needs careful review.",
  },
  {
    title: "Fix empty cart state",
    meta: "Open 1 day, 34 lines changed",
    risk: "low",
    summary: "Small UI fix with low review risk.",
  },
];

const activity = [
  { day: "Mon", commits: 19 },
  { day: "Tue", commits: 28 },
  { day: "Wed", commits: 22 },
  { day: "Thu", commits: 31 },
  { day: "Fri", commits: 25 },
  { day: "Sat", commits: 8 },
  { day: "Sun", commits: 13 },
];

const qualitySignals = [
  { label: "Large files", value: "7" },
  { label: "High-churn files", value: "12" },
  { label: "TODO/FIXME notes", value: "38" },
  { label: "Files without nearby tests", value: "21" },
];

const suggestions = [
  {
    title: "Split large pull requests before review",
    body: "Two open pull requests are over 500 changed lines. Smaller PRs usually move faster and reduce review risk.",
  },
  {
    title: "Add tests around high-churn files",
    body: "The checkout and inventory modules change often, which makes them good candidates for focused regression tests.",
  },
  {
    title: "Review stale work twice a week",
    body: "A simple stale PR routine can prevent important changes from quietly drifting for days.",
  },
];

function renderMetrics() {
  const container = document.querySelector("#overview");
  container.innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric">
          <span>${metric.label}</span>
          <strong>${metric.value}</strong>
          <span>${metric.note}</span>
        </article>
      `,
    )
    .join("");
}

function renderPullRequests() {
  const container = document.querySelector("#pull-request-list");
  container.innerHTML = pullRequests
    .map(
      (pr) => `
        <section class="list-row">
          <div class="list-row-top">
            <h4>${pr.title}</h4>
            <strong class="risk-${pr.risk}">${pr.risk}</strong>
          </div>
          <p>${pr.meta}</p>
          <p>${pr.summary}</p>
        </section>
      `,
    )
    .join("");
}

function renderActivity() {
  const container = document.querySelector("#activity-chart");
  const maxCommits = Math.max(...activity.map((item) => item.commits));

  container.innerHTML = activity
    .map((item) => {
      const height = Math.round((item.commits / maxCommits) * 100);

      return `
        <div class="bar">
          <div class="bar-value" style="height: ${height}%"></div>
          <div class="bar-label">${item.day}</div>
        </div>
      `;
    })
    .join("");
}

function renderQualitySignals() {
  const container = document.querySelector("#quality-list");
  container.innerHTML = qualitySignals
    .map(
      (signal) => `
        <div class="signal">
          <strong>${signal.label}</strong>
          <span>${signal.value}</span>
        </div>
      `,
    )
    .join("");
}

function renderSuggestions() {
  const container = document.querySelector("#suggestion-list");
  container.innerHTML = suggestions
    .map(
      (suggestion) => `
        <section class="suggestion">
          <h4>${suggestion.title}</h4>
          <p>${suggestion.body}</p>
        </section>
      `,
    )
    .join("");
}

renderMetrics();
renderPullRequests();
renderActivity();
renderQualitySignals();
renderSuggestions();

