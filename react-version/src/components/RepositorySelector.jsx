function RepositorySelector({
  selectedRepository,
  onRepositoryChange,
}) {
  return (
    <select
      value={selectedRepository}
      onChange={(event) => onRepositoryChange(event.target.value)}
    >
      <option value="shopfront">open-source/shopfront</option>
      <option value="api-service">open-source/api-service</option>
      <option value="mobile-app">open-source/mobile-app</option>
    </select>
  );
}

export default RepositorySelector;
