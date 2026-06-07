const repositoryMetrics = {
  shopfront: [
    { label: "Open PRs", value: "18", note: "5 waiting on review" },
    { label: "Avg merge time", value: "2.8d", note: "Down 14% this month" },
    { label: "Commits", value: "146", note: "Last 30 days" },
    { label: "Health score", value: "82", note: "Strong, with review risk" },
  ],
  "api-service": [
    { label: "Open PRs", value: "9", note: "2 waiting on review" },
    { label: "Avg merge time", value: "1.6d", note: "Down 8% this month" },
    { label: "Commits", value: "203", note: "Last 30 days" },
    { label: "Health score", value: "91", note: "Healthy and moving quickly" },
  ],
  "mobile-app": [
    { label: "Open PRs", value: "24", note: "8 waiting on review" },
    { label: "Avg merge time", value: "4.2d", note: "Up 19% this month" },
    { label: "Commits", value: "98", note: "Last 30 days" },
    { label: "Health score", value: "68", note: "Review backlog needs attention" },
  ],
};

const shopfrontPullRequests = [
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

const repositoryPullRequests = {
  shopfront: shopfrontPullRequests,
  "api-service": [
    {
      title: "Add request tracing headers",
      meta: "Open 6 days, 318 lines changed",
      risk: "medium",
      summary:
        "Changes shared middleware and should be checked across every API route.",
    },
    {
      title: "Rate-limit authentication endpoints",
      meta: "Open 4 days, 176 lines changed",
      risk: "high",
      summary:
        "Security-sensitive behavior needs review under both normal and burst traffic.",
    },
    {
      title: "Document pagination parameters",
      meta: "Open 1 day, 42 lines changed",
      risk: "low",
      summary: "Documentation-only change with a small review surface.",
    },
  ],
  "mobile-app": [
    {
      title: "Rework offline synchronization",
      meta: "Open 12 days, 921 lines changed",
      risk: "high",
      summary:
        "Large state-management change has remained open and needs focused review.",
    },
    {
      title: "Add biometric sign-in",
      meta: "Open 5 days, 287 lines changed",
      risk: "medium",
      summary:
        "Touches authentication and device APIs, so failure paths need testing.",
    },
    {
      title: "Fix profile image cropping",
      meta: "Open 2 days, 51 lines changed",
      risk: "low",
      summary: "Small presentation fix with limited application impact.",
    },
  ],
};

const shopfrontActivity = [
  { day: "Mon", commits: 19 },
  { day: "Tue", commits: 28 },
  { day: "Wed", commits: 22 },
  { day: "Thu", commits: 31 },
  { day: "Fri", commits: 25 },
  { day: "Sat", commits: 8 },
  { day: "Sun", commits: 13 },
];

const repositoryActivity = {
  shopfront: shopfrontActivity,
  "api-service": [
    { day: "Mon", commits: 31 },
    { day: "Tue", commits: 26 },
    { day: "Wed", commits: 38 },
    { day: "Thu", commits: 42 },
    { day: "Fri", commits: 35 },
    { day: "Sat", commits: 17 },
    { day: "Sun", commits: 14 },
  ],
  "mobile-app": [
    { day: "Mon", commits: 12 },
    { day: "Tue", commits: 18 },
    { day: "Wed", commits: 14 },
    { day: "Thu", commits: 21 },
    { day: "Fri", commits: 16 },
    { day: "Sat", commits: 9 },
    { day: "Sun", commits: 8 },
  ],
};

const repositoryData = {
  shopfront: {
    metrics: repositoryMetrics.shopfront,
    pullRequests: repositoryPullRequests.shopfront,
    activity: repositoryActivity.shopfront,
  },
  "api-service": {
    metrics: repositoryMetrics["api-service"],
    pullRequests: repositoryPullRequests["api-service"],
    activity: repositoryActivity["api-service"],
  },
  "mobile-app": {
    metrics: repositoryMetrics["mobile-app"],
    pullRequests: repositoryPullRequests["mobile-app"],
    activity: repositoryActivity["mobile-app"],
  },
};

let metrics = repositoryData.shopfront.metrics;
let pullRequests = repositoryData.shopfront.pullRequests;
let activity = repositoryData.shopfront.activity;

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
  const allActivity = Object.values(repositoryActivity).flat();
  const maxCommits = Math.max(...allActivity.map((item) => item.commits));

  container.innerHTML = activity
    .map((item) => {
      const height = Math.round((item.commits / maxCommits) * 100);

      return `
        <div class="bar">
          <div class="bar-track">
            <div class="bar-value" style="height: ${height}%">
              <span class="bar-count">${item.commits}</span>
            </div>
          </div>
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

function refreshDashboard() {
  refreshButton.textContent = "Refreshing...";
  refreshButton.disabled = true;
  setTimeout(function () {
    const currentValue = Number(metrics[0].value);
    const newValue = currentValue + 1;
    metrics[0].value = String(newValue);
    renderMetrics();
    const now = new Date();

    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    refreshButton.textContent = "Refresh";
    refreshButton.disabled = false;
    lastUpdated.textContent = `Updated at ${time}`;
  }, 1000);
}

function changeRepository() {
  const selectedRepository = repositorySelect.value;
  const selectedData = repositoryData[selectedRepository];

  metrics = selectedData.metrics;
  pullRequests = selectedData.pullRequests;
  activity = selectedData.activity;

  renderMetrics();
  renderPullRequests();
  renderActivity();

  lastUpdated.textContent = "Updated today";
}

renderMetrics();
renderPullRequests();
renderActivity();
renderQualitySignals();
renderSuggestions();

const refreshButton = document.querySelector(".secondary");
const lastUpdated = document.querySelector("#last-updated");
const repositorySelect = document.querySelector("#repository-select");


repositorySelect.addEventListener("change", changeRepository);

refreshButton.addEventListener("click", refreshDashboard);
