import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import QuestionCard from "../../../components/recruiter/QuestionCard";
import QuestionEditor from "../../../components/recruiter/QuestionEditor";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import { getAssessmentById, updateAssessment } from "../../../services/assessmentService";

export default function QuestionManager() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAssessmentById(id);
      setAssessment(data.assessment);
      setQuestions(data.assessment.questions || []);
      setDirty(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load questions right now");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const handleAddQuestion = () => {
    setEditingIndex(null);
    setShowEditor(true);
  };

  const handleEditQuestion = (index) => {
    setEditingIndex(index);
    setShowEditor(true);
  };

  const handleDeleteQuestion = (index) => {
    if (!window.confirm("Remove this question from the assessment?")) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleSaveQuestion = (question) => {
    if (editingIndex !== null) {
      setQuestions((prev) => prev.map((q, i) => (i === editingIndex ? question : q)));
    } else {
      setQuestions((prev) => [...prev, question]);
    }
    setShowEditor(false);
    setEditingIndex(null);
    setDirty(true);
  };

  const moveQuestion = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setQuestions(updated);
    setDirty(true);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError("");
    try {
      const normalized = questions.map((q, i) => ({
        questionText: q.question_text ?? q.questionText,
        questionType: q.question_type ?? q.questionType,
        options: q.options ?? [],
        correctAnswer: q.correct_answer ?? q.correctAnswer ?? null,
        marks: Number(q.marks) || 1,
        orderIndex: i
      }));
      await updateAssessment(id, { questions: normalized });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save questions right now");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RecruiterDashboardLayout>
        <p className="text-gray-500">Loading questions...</p>
      </RecruiterDashboardLayout>
    );
  }

  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-[#3E3A74]">Question Manager</h1>
            {assessment && <StatusBadge status={assessment.status} />}
          </div>
          <p className="mt-2 text-gray-500">{assessment?.title}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/recruiter/assessments/${id}`}
            className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Back to Details
          </Link>
          <button
            onClick={handleAddQuestion}
            className="px-6 py-3 rounded-xl border border-[#7393D3] text-[#3E3A74] font-medium hover:bg-[#7393D3]/10 transition"
          >
            + Add Question
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Total Questions</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{questions.length}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Total Marks</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{totalMarks}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Duration</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{assessment?.duration_minutes}m</h2>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}

      {dirty && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <span>You have unsaved changes to the question list.</span>
          <div className="flex gap-3">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-5 py-2 rounded-xl transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={load} className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition">
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {questions.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
            No questions yet. Add your first question to build this assessment.
          </div>
        )}
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col gap-1 pt-6">
              <button
                onClick={() => moveQuestion(i, -1)}
                disabled={i === 0}
                className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => moveQuestion(i, 1)}
                disabled={i === questions.length - 1}
                className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                title="Move down"
              >
                ↓
              </button>
            </div>
            <div className="flex-1">
              <QuestionCard question={q} index={i} onEdit={handleEditQuestion} onDelete={handleDeleteQuestion} />
            </div>
          </div>
        ))}
      </div>

      {showEditor && (
        <QuestionEditor
          initialQuestion={editingIndex !== null ? questions[editingIndex] : null}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowEditor(false);
            setEditingIndex(null);
          }}
        />
      )}
    </RecruiterDashboardLayout>
  );
}
