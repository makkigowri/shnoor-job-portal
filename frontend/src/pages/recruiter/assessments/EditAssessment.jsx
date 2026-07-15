import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import TimerSettings from "../../../components/recruiter/TimerSettings";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import { getAssessmentById, updateAssessment } from "../../../services/assessmentService";
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
  const [questionCount, setQuestionCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    getMyJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
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
        setQuestionCount(a.question_count ?? (a.questions ? a.questions.length : 0));
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load this assessment right now");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      await updateAssessment(id, {
        title: form.title,
        description: form.description || undefined,
        instructions: form.instructions || undefined,
        jobId: form.jobId ? Number(form.jobId) : undefined,
        durationMinutes: Number(form.durationMinutes) || 30,
        passingMarks: Number(form.passingMarks) || 0
      });
      navigate(`/recruiter/assessments/${id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update this assessment right now");
    } finally {
      setSubmitting(false);
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
          <p className="mt-2 text-gray-500">Update assessment details, timer and scoring rules.</p>
        </div>
        <Link
          to={`/recruiter/assessments/${id}/questions`}
          className="px-6 py-3 rounded-xl border border-[#7393D3] text-[#3E3A74] font-medium hover:bg-[#7393D3]/10 transition"
        >
          Manage Questions ({questionCount})
        </Link>
      </div>

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
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/recruiter/assessments/${id}`)}
            className="px-8 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </RecruiterDashboardLayout>
  );
}
