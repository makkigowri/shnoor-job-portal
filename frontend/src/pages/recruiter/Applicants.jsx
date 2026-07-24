import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getApplicants, exportApplicants } from "../../services/recruiterService";
import { runAtsForJob } from "../../services/atsService";
import { getMyJobs } from "../../services/jobService";
const statusBadge = (status) => {
  switch (status) {
    case "Shortlisted":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-600";
    case "Interview Scheduled":
      return "bg-blue-100 text-blue-700";
    case "Under Review":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
const atsScoreColor = (score) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-500";
};
export default function Applicants() {
  const [searchParams] = useSearchParams();
  const nameSearch = (searchParams.get("search") || "").toLowerCase();
  const [jobs, setJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState("");
  const [runSummary, setRunSummary] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  useEffect(() => {
    getMyJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch(() => {});
  }, []);
  const loadApplicants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getApplicants({ jobId: jobFilter || undefined });
      const list = data.applicants || [];
      setApplicants(
        nameSearch
          ? list.filter((a) => a.candidate_name?.toLowerCase().includes(nameSearch))
          : list
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load applicants right now");
    } finally {
      setLoading(false);
    }
  }, [jobFilter, nameSearch]);
  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);
  useEffect(() => {
    setRunSummary(null);
    setRunError("");
    setExportError("");
  }, [jobFilter]);
  const handleRunAts = async () => {
    if (!jobFilter) return;
    setRunning(true);
    setRunError("");
    setRunSummary(null);
    try {
      const data = await runAtsForJob(jobFilter);
      setRunSummary(data.summary || null);
      await loadApplicants();
    } catch (err) {
      setRunError(err?.response?.data?.message || "Unable to run ATS scoring right now");
    } finally {
      setRunning(false);
    }
  };
  const handleExport = async () => {
    if (!jobFilter) return;
    setExporting(true);
    setExportError("");
    try {
      await exportApplicants(jobFilter);
    } catch (err) {
      setExportError(err?.response?.data?.message || "Unable to export applicants right now");
    } finally {
      setExporting(false);
    }
  };
  const selectedJobTitle = jobs.find((job) => String(job.id) === String(jobFilter))?.title;
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Applicants</h1>
          <p className="mt-2 text-gray-500">Review applicants by job and run ATS scoring when you're ready.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 bg-white focus:border-[#7393D3] focus:outline-none"
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRunAts}
            disabled={!jobFilter || running}
            title={!jobFilter ? "Select a specific job to run ATS scoring" : undefined}
            className="bg-[#7393D3] hover:bg-[#5E84D6] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl transition whitespace-nowrap"
          >
            {running ? "Running ATS..." : "Run ATS Score"}
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!jobFilter || exporting}
            title={!jobFilter ? "Select a specific job to export applications" : undefined}
            className="border border-[#7393D3] text-[#3E3A74] hover:bg-[#7393D3] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium px-5 py-2.5 rounded-xl transition whitespace-nowrap"
          >
            {exporting ? "Exporting..." : "Export Applications"}
          </button>
        </div>
      </div>
      {!jobFilter && (
        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">
          Select a specific job from "All Jobs" to run ATS scoring for its applicants.
        </div>
      )}
      {runSummary && (
        <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ATS scoring completed for <span className="font-semibold">{selectedJobTitle}</span>:{" "}
          {runSummary.processed} scored ({runSummary.shortlisted} shortlisted, {runSummary.rejected} rejected)
          {runSummary.skipped > 0 && `, ${runSummary.skipped} skipped (no resume text or job skills)`}.
        </div>
      )}
      {runError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {runError}
        </div>
      )}
      {exportError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {exportError}
        </div>
      )}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {loading && <p className="mt-8 text-gray-500">Loading applicants...</p>}
      {!loading && applicants.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          No applicants found. Once job seekers apply to your job posts, they'll show up here.
        </div>
      )}
      {!loading && applicants.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Candidate</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Job Role</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Qualification</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Skills</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">ATS Score</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((candidate) => (
                <tr key={candidate.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-gray-900">{candidate.candidate_name}</div>
                    <div className="text-sm text-gray-500">{candidate.candidate_email}</div>
                  </td>
                  <td className="px-6 py-5 text-gray-900">{candidate.job_title}</td>
                  <td className="px-6 py-5 text-gray-900">
                    {candidate.candidate_qualification || "—"}
                  </td>
                  <td className="px-6 py-5 text-gray-900 max-w-xs truncate" title={candidate.candidate_skills}>
                    {candidate.candidate_skills || "—"}
                  </td>
                  <td className="px-6 py-5">
                    {candidate.ats_score != null ? (
                      <span
                        className={`font-semibold ${atsScoreColor(candidate.ats_score)}`}
                        title={[
                          candidate.ats_matched_skills ? `Matched: ${candidate.ats_matched_skills}` : "",
                          candidate.ats_missing_skills ? `Missing: ${candidate.ats_missing_skills}` : ""
                        ].filter(Boolean).join(" | ")}
                      >
                        {candidate.ats_score}%
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(candidate.status)}`}>
                      {candidate.status}
                    </span>
                    {candidate.interview_date && (
                      <div className="text-xs text-gray-500 mt-1">
                        Interview: {candidate.interview_date} {candidate.interview_time}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RecruiterDashboardLayout>
  );
}
