function RepositorySelector({
  repositories,
  selectedRepository,
  onRepositoryChange,
}) {
  return (
    <select
      value={selectedRepository}
      onChange={(event) => onRepositoryChange(event.target.value)}
    >
      {repositories.map((repository) => (
        <option key={repository} value={repository}>
          open-source/{repository}
        </option>
      ))}
    </select>
  );
}

export default RepositorySelector;
