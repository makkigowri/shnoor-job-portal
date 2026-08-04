import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import { createAssessment } from "../../../services/assessmentService";
import { getMyJobs } from "../../../services/jobService";
const initialState = {
  title: "",
  assessmentLink: "",
  jobId: ""
};
export default function CreateAssessment() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [jobs, setJobs] = useState([]);
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
      const payload = {
        title: form.title,
        description: form.assessmentLink,
        instructions: undefined,
        jobId: form.jobId ? Number(form.jobId) : undefined
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
      <p className="mt-2 text-gray-500">Save a job-linked external assessment URL for shortlisted candidates.</p>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
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
              placeholder="Java Developer Assessment"
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
    </RecruiterDashboardLayout>
  );
}
