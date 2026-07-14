import StatusBadge from "./StatusBadge";
const ResultTable = ({ results, onViewDetail }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-6 py-4">Rank</th>
            <th className="text-left px-6 py-4">Candidate</th>
            <th className="text-left px-6 py-4">Score</th>
            <th className="text-left px-6 py-4">Percentage</th>
            <th className="text-left px-6 py-4">Result</th>
            <th className="text-left px-6 py-4">Status</th>
            <th className="text-center px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row) => (
            <tr key={row.id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-5 font-semibold text-gray-900">#{row.rank}</td>
              <td className="px-6 py-5">
                <div className="font-semibold text-gray-900">{row.candidate_name}</div>
                <div className="text-sm text-gray-500">{row.candidate_email}</div>
              </td>
              <td className="px-6 py-5 text-gray-900">
                {row.total_score} / {row.max_score}
              </td>
              <td className="px-6 py-5 text-gray-900">
                {row.percentage != null ? `${Number(row.percentage).toFixed(1)}%` : "—"}
              </td>
              <td className="px-6 py-5">
                <StatusBadge status={row.result} />
              </td>
              <td className="px-6 py-5">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-6 py-5 text-center">
                <button
                  onClick={() => onViewDetail(row.id)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm font-medium transition"
                >
                  View Answers
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
