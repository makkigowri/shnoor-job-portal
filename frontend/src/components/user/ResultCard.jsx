const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

// Top-of-page summary card on the Assessment Result page: score, percentage,
// pass/fail outcome and time taken.
const ResultCard = ({ submission }) => {
  const isPass = submission.result === "Pass";
  return (
    <div
      className={`rounded-2xl border shadow-sm p-8 text-center ${
        isPass ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      }`}
    >
      <div
        className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold ${
          isPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}
      >
        {isPass ? "✓" : "✕"}
      </div>
      <h2 className={`mt-4 text-2xl font-bold ${isPass ? "text-green-700" : "text-red-600"}`}>
        {isPass ? "Congratulations, you passed!" : "You did not meet the passing score"}
      </h2>
      <div className="mt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto">
        <div>
          <p className="text-gray-500 text-sm">Score</p>
          <p className="text-2xl font-bold text-[#3E3A74] mt-1">
            {submission.total_score} / {submission.max_score}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Percentage</p>
          <p className="text-2xl font-bold text-[#3E3A74] mt-1">
            {submission.percentage != null ? `${Number(submission.percentage).toFixed(1)}%` : "—"}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Time Taken</p>
          <p className="text-2xl font-bold text-[#3E3A74] mt-1">
            {formatDuration(submission.time_taken_seconds)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
