import { useState } from "react";
const emptyQuestion = {
  questionText: "",
  questionType: "mcq",
  options: ["", "", "", ""],
  correctAnswer: "",
  marks: 1
};
const QuestionEditor = ({ initialQuestion, onSave, onCancel }) => {
  const [question, setQuestion] = useState(() => {
    if (!initialQuestion) return { ...emptyQuestion };
    let options = initialQuestion.options ?? initialQuestion.questionType === "mcq" ? initialQuestion.options : [];
    if (typeof options === "string") {
      try {
        options = JSON.parse(options);
      } catch {
        options = [];
      }
    }
    return {
      questionText: initialQuestion.question_text ?? initialQuestion.questionText ?? "",
      questionType: initialQuestion.question_type ?? initialQuestion.questionType ?? "mcq",
      options: Array.isArray(options) && options.length > 0 ? options : ["", "", "", ""],
      correctAnswer: initialQuestion.correct_answer ?? initialQuestion.correctAnswer ?? "",
      marks: initialQuestion.marks ?? 1
    };
  });
  const [error, setError] = useState("");
  const handleTypeChange = (type) => {
    setQuestion((prev) => ({
      ...prev,
      questionType: type,
      options: type === "mcq" ? (prev.options.length ? prev.options : ["", "", "", ""]) : [],
      correctAnswer: type === "true_false" ? "True" : ""
    }));
  };
  const handleOptionChange = (index, value) => {
    const options = [...question.options];
    options[index] = value;
    setQuestion({ ...question, options });
  };
  const addOption = () => setQuestion({ ...question, options: [...question.options, ""] });
  const removeOption = (index) => {
    const options = question.options.filter((_, i) => i !== index);
    setQuestion({
      ...question,
      options,
      correctAnswer: question.correctAnswer === question.options[index] ? "" : question.correctAnswer
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!question.questionText.trim()) {
      setError("Question text is required");
      return;
    }
    if (question.questionType === "mcq") {
      const cleanOptions = question.options.map((o) => o.trim()).filter(Boolean);
      if (cleanOptions.length < 2) {
        setError("Provide at least 2 options for a multiple choice question");
        return;
      }
      if (!question.correctAnswer || !cleanOptions.includes(question.correctAnswer)) {
        setError("Select a valid correct answer from the options");
        return;
      }
      onSave({ ...question, options: cleanOptions, marks: Number(question.marks) || 1 });
      return;
    }
    if (question.questionType === "true_false" && !question.correctAnswer) {
      setError("Select the correct answer (True or False)");
      return;
    }
    onSave({ ...question, options: [], marks: Number(question.marks) || 1 });
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#3E3A74]">
          {initialQuestion ? "Edit Question" : "Add Question"}
        </h2>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="font-medium text-gray-900 text-sm">Question Text</label>
            <textarea
              rows="3"
              value={question.questionText}
              onChange={(e) => setQuestion({ ...question, questionText: e.target.value })}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              placeholder="Enter the question"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-900 text-sm">Question Type</label>
              <select
                value={question.questionType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-gray-900 text-sm">Marks</label>
              <input
                type="number"
                min="1"
                value={question.marks}
                onChange={(e) => setQuestion({ ...question, marks: e.target.value })}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
          </div>
          {question.questionType === "mcq" && (
            <div>
              <label className="font-medium text-gray-900 text-sm">Options (select the correct one)</label>
              <div className="mt-2 space-y-3">
                {question.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt !== "" && opt === question.correctAnswer}
                      onChange={() => setQuestion({ ...question, correctAnswer: opt })}
                      className="h-4 w-4 accent-[#7393D3]"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 border border-gray-300 rounded-xl p-2.5 focus:border-[#7393D3] focus:outline-none"
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-3 text-[#7393D3] font-semibold text-sm"
              >
                + Add Option
              </button>
            </div>
          )}
          {question.questionType === "true_false" && (
            <div>
              <label className="font-medium text-gray-900 text-sm">Correct Answer</label>
              <div className="mt-2 flex gap-4">
                {["True", "False"].map((val) => (
                  <label key={val} className="flex items-center gap-2 text-gray-900">
                    <input
                      type="radio"
                      name="tfAnswer"
                      checked={question.correctAnswer === val}
                      onChange={() => setQuestion({ ...question, correctAnswer: val })}
                      className="h-4 w-4 accent-[#7393D3]"
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>
          )}
          {question.questionType === "short_answer" && (
            <div>
              <label className="font-medium text-gray-900 text-sm">Expected Answer (optional, for reference)</label>
              <input
                type="text"
                value={question.correctAnswer}
                onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
                placeholder="Reference answer for manual review"
              />
            </div>
          )}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 rounded-xl transition"
            >
              Save Question
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default QuestionEditor;
