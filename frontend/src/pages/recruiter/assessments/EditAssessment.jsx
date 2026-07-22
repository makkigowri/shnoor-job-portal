import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import TimerSettings from "../../../components/recruiter/TimerSettings";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import QuestionCard from "../../../components/recruiter/QuestionCard";
import QuestionEditor from "../../../components/recruiter/QuestionEditor";
import { getAssessmentById, updateAssessment, publishAssessment } from "../../../services/assessmentService";
import { getMyJobs } from "../../../services/jobService";
const initialState = {
  title: "",
  description: "",
  instructions: "",
  jobId: "",
  durationMinutes: 30,
  passingMarks: 0
};
export default function EditAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState("Draft");
  const [jobs, setJobs] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    getMyJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch(() => {});
  }, []);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAssessmentById(id);
      const a = data.assessment;
      setForm({
        title: a.title || "",
        description: a.description || "",
        instructions: a.instructions || "",
        jobId: a.job_id || "",
        durationMinutes: a.duration_minutes || 30,
        passingMarks: a.passing_marks || 0
      });
      setStatus(a.status);
      setQuestions(a.questions || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load this assessment right now");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
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
  };
  const handleSaveQuestion = (question) => {
    if (editingIndex !== null) {
      setQuestions((prev) => prev.map((q, i) => (i === editingIndex ? question : q)));
    } else {
      setQuestions((prev) => [...prev, question]);
    }
    setShowEditor(false);
    setEditingIndex(null);
  };
  const moveQuestion = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setQuestions(updated);
  };
  const buildQuestionsPayload = () =>
    questions.map((q, i) => ({
      questionText: q.question_text ?? q.questionText,
      questionType: q.question_type ?? q.questionType,
      options: q.options ?? [],
      correctAnswer: q.correct_answer ?? q.correctAnswer ?? null,
      marks: Number(q.marks) || 1,
      orderIndex: i
    }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title.trim()) {
      setError("Assessment title is required");
      return;
    }
    setSubmitting(true);
    try {
      await updateAssessment(id, {
        title: form.title,
        description: form.description || undefined,
        instructions: form.instructions || undefined,
        jobId: form.jobId ? Number(form.jobId) : undefined,
        durationMinutes: Number(form.durationMinutes) || 30,
        passingMarks: Number(form.passingMarks) || 0,
        questions: buildQuestionsPayload()
      });
      setSuccess("Assessment updated successfully");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update this assessment right now");
    } finally {
      setSubmitting(false);
    }
  };
  const handlePublish = async () => {
    setError("");
    setSuccess("");
    setPublishing(true);
    try {
      await updateAssessment(id, {
        title: form.title,
        description: form.description || undefined,
        instructions: form.instructions || undefined,
        jobId: form.jobId ? Number(form.jobId) : undefined,
        durationMinutes: Number(form.durationMinutes) || 30,
        passingMarks: Number(form.passingMarks) || 0,
        questions: buildQuestionsPayload()
      });
      const data = await publishAssessment(id);
      setSuccess(data.message || "Assessment published successfully");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to publish this assessment right now");
    } finally {
      setPublishing(false);
    }
  };
  if (loading) {
    return (
      <RecruiterDashboardLayout>
        <p className="text-gray-500">Loading assessment...</p>
      </RecruiterDashboardLayout>
    );
  }
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-[#3E3A74]">Edit Assessment</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-2 text-gray-500">Update every detail of this assessment from a single page.</p>
        </div>
        <Link
          to={`/recruiter/assessments/${id}`}
          className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Back to Details
        </Link>
      </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">{success}</div>
      )}
      <form onSubmit={handleSubmit} className="bg-white mt-8 rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="font-medium text-gray-900">Assessment Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-medium text-gray-900">Linked Job (optional)</label>
            <select
              name="jobId"
              value={form.jobId}
              onChange={handleChange}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            >
              <option value="">Not linked to a specific job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Shortlisted candidates for the linked job are automatically assigned when this assessment is published.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <label className="font-medium text-gray-900">Assessment Description</label>
          <textarea
            rows="3"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            placeholder="Briefly describe what this assessment evaluates"
          />
        </div>
        <div className="mt-6">
          <label className="font-medium text-gray-900">Instructions for Candidates</label>
          <textarea
            rows="4"
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            placeholder="e.g. Do not refresh the page. Answer all questions before the timer ends."
          />
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#3E3A74]">Timer & Scoring</h2>
          <div className="mt-4">
            <TimerSettings
              durationMinutes={form.durationMinutes}
              passingMarks={form.passingMarks}
              onChange={(update) => setForm({ ...form, ...update })}
            />
            <p className="mt-2 text-xs text-gray-500">
              Total marks are calculated automatically from the questions below ({totalMarks} marks).
            </p>
          </div>
        </div>
        <div className="mt-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-[#3E3A74]">Questions ({questions.length})</h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-5 py-2.5 rounded-xl border border-[#7393D3] text-[#3E3A74] font-medium hover:bg-[#7393D3]/10 transition"
            >
              + Add Question
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Add, edit, remove or reorder questions, options and correct answers here.
          </p>
          <div className="mt-5 space-y-4">
            {questions.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500">
                No questions added yet.
              </div>
            )}
            {questions.map((q, i) => (
              <div key={q.id ?? i} className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-6">
                  <button
                    type="button"
                    onClick={() => moveQuestion(i, -1)}
                    disabled={i === 0}
                    className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
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
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={submitting || publishing}
            className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          {status === "Draft" && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={submitting || publishing}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl transition disabled:opacity-60"
            >
              {publishing ? "Publishing..." : "Save & Publish"}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(`/recruiter/assessments/${id}`)}
            className="px-8 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
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
