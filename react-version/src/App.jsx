import { useState } from "react";
import MetricGrid from "./components/MetricGrid";

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

function App() {
  const [selectedRepository, setSelectedRepository] = useState("shopfront");
  const metrics = repositoryMetrics[selectedRepository];

  return (
    <main>
      <h1>RepoPulse React Version</h1>
      <p>This is where we will migrate the dashboard piece by piece.</p>

      <select
        value={selectedRepository}
        onChange={(event) => setSelectedRepository(event.target.value)}
      >
        <option value="shopfront">open-source/shopfront</option>
        <option value="api-service">open-source/api-service</option>
        <option value="mobile-app">open-source/mobile-app</option>
      </select>

      <MetricGrid metrics={metrics} />
    </main>
  );
}

export default App;
