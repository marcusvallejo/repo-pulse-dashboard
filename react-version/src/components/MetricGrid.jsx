import MetricCard from "./MetricCard";

function MetricGrid({ metrics }) {
  return (
    <section>
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}

export default MetricGrid;