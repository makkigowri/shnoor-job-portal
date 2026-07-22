const QuestionNavigator = ({ questions, answeredMap, currentIndex, onNavigate }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-[#3E3A74] mb-4">Question Palette</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const isAnswered = Boolean(answeredMap[q.id]);
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onNavigate(i)}
              className={`h-10 w-10 rounded-lg text-sm font-semibold flex items-center justify-center transition-all ${
                isCurrent
                  ? "bg-[#3E3A74] text-white ring-2 ring-offset-2 ring-[#3E3A74]"
                  : isAnswered
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-current={isCurrent}
              aria-label={`Question ${i + 1}${isAnswered ? " (answered)" : " (unanswered)"}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-5 space-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-green-100 border border-green-200" /> Answered
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-gray-100 border border-gray-200" /> Not Answered
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-[#3E3A74]" /> Current
        </div>
      </div>
    </div>
  );
};
export default QuestionNavigator;
