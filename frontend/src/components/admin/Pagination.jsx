const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(Math.max(page - 1, 1))}
          disabled={page <= 1}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => onChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
