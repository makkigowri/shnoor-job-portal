import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import TimerSettings from "../../../components/recruiter/TimerSettings";
import QuestionCard from "../../../components/recruiter/QuestionCard";
import QuestionEditor from "../../../components/recruiter/QuestionEditor";
import { createAssessment } from "../../../services/assessmentService";
import { getMyJobs } from "../../../services/jobService";

const initialState = {
  title: "",
  description: "",
  instructions: "",
  jobId: "",
  durationMinutes: 30,
  passingMarks: 0
};

export default function CreateAssessment() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [jobs, setJobs] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch(() => {});
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Assessment title is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        instructions: form.instructions || undefined,
        jobId: form.jobId ? Number(form.jobId) : undefined,
        durationMinutes: Number(form.durationMinutes) || 30,
        passingMarks: Number(form.passingMarks) || 0,
        questions: questions.length > 0 ? questions : undefined
      };
      const data = await createAssessment(payload);
      navigate(`/recruiter/assessments/${data.assessment.id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create this assessment right now");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RecruiterDashboardLayout>
      <h1 className="text-4xl font-bold text-[#3E3A74]">Create Assessment</h1>
      <p className="mt-2 text-gray-500">Set up a new candidate assessment for your job openings.</p>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
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
              placeholder="Frontend Developer Screening Test"
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
              Only candidates shortlisted for the linked job can be assigned. Leave blank to assign any shortlisted candidate.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="font-medium text-gray-900">Description</label>
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
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-[#3E3A74]">
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-5 py-2.5 rounded-xl border border-[#7393D3] text-[#3E3A74] font-medium hover:bg-[#7393D3]/10 transition"
            >
              + Add Question
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            You can also add questions later from the Question Manager. An assessment needs at least one question before it can be published.
          </p>
          <div className="mt-5 space-y-4">
            {questions.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500">
                No questions added yet.
              </div>
            )}
            {questions.map((q, i) => (
              <QuestionCard
                key={i}
                question={q}
                index={i}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Assessment"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/recruiter/assessments")}
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
