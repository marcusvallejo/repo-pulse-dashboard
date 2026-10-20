import "./GithubCommitActivity.css";

function formatDate(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function GithubCommitActivity({ days, mayBeIncomplete, fetchLimit }) {
  const maximum = Math.max(1, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <section className="commit-activity" aria-labelledby="commit-activity-title">
      <h2 id="commit-activity-title">Commit activity</h2>
      <p>Last 30 calendar days, including today (UTC). Default branch.</p>
      {mayBeIncomplete && (
        <p role="note">
          Limited to the latest {fetchLimit} fetched commits. Earlier activity may be missing.
        </p>
      )}
      {total === 0 && <p>No commits in the fetched data for this period.</p>}
      <div className="commit-activity__scroll">
        <div
          className="commit-activity__plot"
          role="img"
          aria-label={`${total} fetched commits over 30 days. Highest daily count: ${maximum === 1 && total === 0 ? 0 : maximum}. Daily values are available in the table below.`}
        >
          {days.map((day) => (
            <div className="commit-activity__column" key={day.date}>
              <div className="commit-activity__track">
                <div
                  className="commit-activity__bar"
                  style={{ height: `${(day.count / maximum) * 100}%` }}
                  title={`${formatDate(day.date)}: ${day.count} commits`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="commit-activity__dates" aria-hidden="true">
          <span>{days.length > 0 && formatDate(days[0].date)}</span>
          <span>{days.length > 0 && formatDate(days[days.length - 1].date)}</span>
        </div>
      </div>
      <details>
        <summary>Daily commit counts</summary>
        <table>
          <caption>Fetched commits by UTC date</caption>
          <thead><tr><th scope="col">Date</th><th scope="col">Commits</th></tr></thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.date}><th scope="row">{day.date}</th><td>{day.count}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}

export default GithubCommitActivity;
