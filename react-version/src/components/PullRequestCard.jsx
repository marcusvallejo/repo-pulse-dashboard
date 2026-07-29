function PullRequestCard({ pullRequest }) {
  return (
    <article>
      <h3>{pullRequest.title}</h3>
      <strong>{pullRequest.risk}</strong>
      <p>{pullRequest.meta}</p>
      <p>{pullRequest.summary}</p>
    </article>
  );
}

export default PullRequestCard;
