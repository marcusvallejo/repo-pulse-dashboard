function RefreshButton({ isLoading, onRefresh }) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isLoading}
    >
      {isLoading ? "Refreshing..." : "Refresh data"}
    </button>
  );
}

export default RefreshButton;
