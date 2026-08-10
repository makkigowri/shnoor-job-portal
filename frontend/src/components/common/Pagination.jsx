// Professional, compact pagination control shared across user and recruiter
// facing tables/lists. Mirrors the styling already used for admin tables so
// the pagination UI feels consistent across the whole application.
const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(page - 1, 1))}
          disabled={page <= 1}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
export default Pagination;
