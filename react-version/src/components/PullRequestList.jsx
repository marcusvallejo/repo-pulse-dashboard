import PullRequestCard from "./PullRequestCard";

function PullRequestList({ pullRequests }) {
  return (
    <section>
      <h2>Pull request analytics</h2>

      {pullRequests.map((pullRequest) => (
        <PullRequestCard
          key={pullRequest.title}
          pullRequest={pullRequest}
        />
      ))}
    </section>
  );
}

export default PullRequestList;
