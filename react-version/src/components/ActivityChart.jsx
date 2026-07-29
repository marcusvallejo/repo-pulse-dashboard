import ActivityBar from "./ActivityBar";

function ActivityChart({ activity }) {
  const maxCommits = Math.max(...activity.map((item) => item.commits));

  return (
    <section>
      <h2>Commit activity</h2>

      {activity.map((item) => (
        <ActivityBar
          key={item.day}
          item={item}
          maxCommits={maxCommits}
        />
      ))}
    </section>
  );
}

export default ActivityChart;
