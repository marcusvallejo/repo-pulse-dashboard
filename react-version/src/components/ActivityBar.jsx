function ActivityBar({ item, maxCommits }) {
  const height = Math.round((item.commits / maxCommits) * 100);

  return (
    <div>
      <strong>{item.commits}</strong>
      <div style={{ height: `${height}%` }}></div>
      <span>{item.day}</span>
    </div>
  );
}

export default ActivityBar;
