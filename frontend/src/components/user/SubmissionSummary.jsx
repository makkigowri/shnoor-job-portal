const SubmissionSummary = ({ answers }) => {
  if (!answers || answers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
        No answers were recorded for this submission.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {answers.map((ans, i) => {
        const graded = ans.is_correct !== null && ans.is_correct !== undefined;
        return (
          <div key={ans.id || i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium text-gray-900">
                {i + 1}. {ans.question_text}
              </p>
              {graded && (
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                    ans.is_correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}
                >
                  {ans.is_correct ? "Correct" : "Incorrect"}
                </span>
              )}
              {!graded && (
                <span className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  Pending Review
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Your Answer:{" "}
              <span className="font-medium text-gray-900">{ans.answer_text || "Not answered"}</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Marks Obtained:{" "}
              <span className="font-medium text-gray-900">
                {ans.marks_obtained ?? 0} / {ans.question_marks}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
};
export default SubmissionSummary;
