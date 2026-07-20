const AdminFilterBar = ({
  onSearchSubmit,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  actions
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
      <form onSubmit={onSearchSubmit} className="flex gap-3 w-full lg:w-auto">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full sm:w-72 rounded-xl border border-gray-300 px-4 text-sm text-gray-700 focus:border-[#7393D3] focus:outline-none"
        />
        <button
          type="submit"
          className="h-11 shrink-0 px-5 rounded-xl bg-[#7393D3] text-white text-sm font-medium hover:bg-[#5E84D6] transition"
        >
          Search
        </button>
      </form>
      {(filters.length > 0 || actions) && (
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => (
            <select
              key={filter.name}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-12 w-full sm:w-52 rounded-xl border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-700 focus:border-[#7393D3] focus:outline-none"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
          {actions}
        </div>
      )}
    </div>
  );
};
export default AdminFilterBar;
