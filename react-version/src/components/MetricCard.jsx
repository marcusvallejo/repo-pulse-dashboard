function MetricCard({ metric }) {
  return (
    <article>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      <span>{metric.note}</span>
    </article>
  );
}

export default MetricCard;