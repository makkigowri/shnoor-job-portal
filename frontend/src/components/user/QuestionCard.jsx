const TYPE_LABELS = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer"
};

// Renders a single question with the appropriate answer input for its type,
// and reports changes back up as plain text (to match the backend's
// answer_text column, which is used for auto-grading mcq/true_false).
const QuestionCard = ({ question, index, total, value, onChange }) => {
  let options = question.options;
  if (typeof options === "string") {
    try {
      options = JSON.parse(options);
    } catch {
      options = [];
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-gray-500">
          Question {index + 1} of {total}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {TYPE_LABELS[question.question_type] || "Question"}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#7393D3]/10 text-[#3E3A74]">
          {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
        </span>
      </div>

      <p className="mt-4 text-lg text-gray-900 font-medium">{question.question_text}</p>

      <div className="mt-5 space-y-3">
        {question.question_type === "mcq" &&
          Array.isArray(options) &&
          options.map((opt, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                value === opt
                  ? "border-[#7393D3] bg-[#7393D3]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-[#7393D3] w-4 h-4"
              />
              <span className="text-gray-800">{opt}</span>
            </label>
          ))}

        {question.question_type === "true_false" &&
          ["True", "False"].map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                value === opt
                  ? "border-[#7393D3] bg-[#7393D3]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-[#7393D3] w-4 h-4"
              />
              <span className="text-gray-800">{opt}</span>
            </label>
          ))}

        {question.question_type === "short_answer" && (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            placeholder="Type your answer here..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-[#7393D3] focus:outline-none"
          />
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
