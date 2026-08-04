import { useEffect, useState, useCallback } from "react";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import AssessmentTable from "../../../components/recruiter/AssessmentTable";
import { getMyJobs } from "../../../services/jobService";
export default function AssessmentDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    setSaveError("");
    try {
      const data = await getMyJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load job assessment configuration right now");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);
  const summary = {
    total: jobs.length,
    linked: jobs.filter((job) => job.assessment_link && job.assessment_link.trim()).length,
    shortlisted: jobs.reduce((sum, job) => sum + Number(job.shortlisted_candidates_count || 0), 0)
  };
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Job Assessment </h1>
          <p className="mt-2 text-gray-500">Configure one external assessment link per job. Shortlisted candidates will inherit it automatically.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Total Jobs</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{summary.total}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Linked Jobs</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">{summary.linked}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Shortlisted Candidates</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{summary.shortlisted}</h2>
        </div>
      </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      {saveError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{saveError}</div>
      )}
      {loading && <p className="mt-8 text-gray-500">Loading job assessment configuration...</p>}
      {!loading && jobs.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          No jobs found yet. Create a job first and then assign its assessment link here.
        </div>
      )}
      {!loading && jobs.length > 0 && (
        <div className="mt-8">
          <AssessmentTable
            jobs={jobs}
            onRefresh={loadJobs}
            setSaveError={setSaveError}
          />
        </div>
      )}
    </RecruiterDashboardLayout>
  );
}