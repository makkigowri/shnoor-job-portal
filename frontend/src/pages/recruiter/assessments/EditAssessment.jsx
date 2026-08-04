import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import { getAssessmentById, updateAssessment, publishAssessment } from "../../../services/assessmentService";
import { getMyJobs } from "../../../services/jobService";
const initialState = {
  title: "",
  assessmentLink: "",
  jobId: ""
};
export default function EditAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState("Draft");
  const [jobs, setJobs] = useState([]);
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
        assessmentLink: a.description || "",
        jobId: a.job_id || ""
      });
      setStatus(a.status);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load this assessment right now");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [id]);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title.trim()) {
      setError("Assessment title is required");
      return;
    }
    if (!form.assessmentLink.trim()) {
      setError("Assessment link is required");
      return;
    }
    setSubmitting(true);
    try {
      await updateAssessment(id, {
        title: form.title,
        description: form.assessmentLink,
        instructions: undefined,
        jobId: form.jobId ? Number(form.jobId) : undefined
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
        description: form.assessmentLink,
        instructions: undefined,
        jobId: form.jobId ? Number(form.jobId) : undefined
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
          <p className="mt-2 text-gray-500">Update the external assessment link and its job mapping.</p>
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
            <label className="font-medium text-gray-900">Assessment Name</label>
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
              Only shortlisted candidates for the linked job will see this assessment link.
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="font-medium text-gray-900">Assessment Link</label>
            <input
              name="assessmentLink"
              value={form.assessmentLink}
              onChange={handleChange}
              required
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              placeholder="https://assessment.company.com/java-test"
            />
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
    </RecruiterDashboardLayout>
  );
}
