const TYPE_LABELS = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer"
};
const QuestionCard = ({ question, index, onEdit, onDelete }) => {
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-8 h-8 rounded-full bg-[#7393D3]/10 text-[#3E3A74] font-semibold flex items-center justify-center text-sm">
              {index + 1}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {TYPE_LABELS[question.question_type || question.questionType] || "Question"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#7393D3]/10 text-[#3E3A74]">
              {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
            </span>
          </div>
          <p className="mt-3 text-gray-900 font-medium">{question.question_text || question.questionText}</p>
          {Array.isArray(options) && options.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {options.map((opt, i) => (
                <li
                  key={i}
                  className={`text-sm px-3 py-1.5 rounded-lg ${
                    opt === (question.correct_answer || question.correctAnswer)
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 bg-gray-50"
                  }`}
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
          {(question.question_type || question.questionType) === "true_false" && (
            <p className="mt-2 text-sm text-green-700 font-medium">
              Correct Answer: {question.correct_answer || question.correctAnswer}
            </p>
          )}
          {(question.question_type || question.questionType) === "short_answer" &&
            (question.correct_answer || question.correctAnswer) && (
              <p className="mt-2 text-sm text-green-700 font-medium">
                Expected Answer: {question.correct_answer || question.correctAnswer}
              </p>
            )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex flex-col gap-2 shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(index)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm font-medium transition"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(index)}
                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
