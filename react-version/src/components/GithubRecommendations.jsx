function GithubRecommendations({ recommendations }) {
  if (recommendations.length === 0) {
    return (
      <section>
        <h2>Recommendations</h2>
        <p>No immediate improvements suggested.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Recommendations</h2>

      <ul>
        {recommendations.map((recommendation) => (
          <li key={recommendation.title}>
            <strong>{recommendation.title}</strong>
            <p>Priority: {recommendation.priority}</p>
            <p>{recommendation.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default GithubRecommendations;
