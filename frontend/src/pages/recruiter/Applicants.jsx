import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getApplicants, updateApplicationStatus, scheduleInterview } from "../../services/recruiterService";
import { getMyJobs } from "../../services/jobService";
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
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
const ScheduleInterviewModal = ({ applicant, onClose, onScheduled }) => {
  const [form, setForm] = useState({
    scheduledDate: "",
    scheduledTime: "",
    mode: "Online",
    locationOrLink: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduledDate || !form.scheduledTime) {
      setError("Please choose a date and time");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await scheduleInterview({ applicationId: applicant.id, ...form });
      onScheduled();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to schedule this interview right now");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-[#3E3A74]">
          Schedule Interview
        </h2>
        <p className="mt-1 text-gray-500">
          {applicant.candidate_name} · {applicant.job_title}
        </p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-900 text-sm">Date</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-gray-900 text-sm">Time</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="font-medium text-gray-900 text-sm">Mode</label>
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            >
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>
          <div>
            <label className="font-medium text-gray-900 text-sm">
              {form.mode === "Online" ? "Meeting Link" : "Location"}
            </label>
            <input
              type="text"
              value={form.locationOrLink}
              onChange={(e) => setForm({ ...form, locationOrLink: e.target.value })}
              placeholder={form.mode === "Online" ? "https://meet.google.com/..." : "Office address"}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
          <div>
            <label className="font-medium text-gray-900 text-sm">Notes (optional)</label>
            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 rounded-xl transition disabled:opacity-60"
            >
              {submitting ? "Scheduling..." : "Confirm Schedule"}
            </button>
            <button
              type="button"
              onClick={onClose}
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
export default function Applicants() {
  const [searchParams] = useSearchParams();
  const nameSearch = (searchParams.get("search") || "").toLowerCase();
  const [jobs, setJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  useEffect(() => {
    getMyJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch(() => {});
  }, []);
  const loadApplicants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getApplicants({
        jobId: jobFilter || undefined,
        status: statusFilter || undefined
      });
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
  }, [jobFilter, statusFilter, nameSearch]);
  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);
  const handleStatusChange = async (applicant, status) => {
    setActionError("");
    setActioningId(applicant.id);
    try {
      await updateApplicationStatus(applicant.id, status);
      setApplicants((prev) =>
        prev.map((item) => (item.id === applicant.id ? { ...item, status } : item))
      );
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to update this application right now");
    } finally {
      setActioningId(null);
    }
  };
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Applicants</h1>
          <p className="mt-2 text-gray-500">Review and manage all applications submitted for your job openings.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
          >
            <option value="">All Status</option>
            <option>Applied</option>
            <option>Under Review</option>
            <option>Shortlisted</option>
            <option>Interview Scheduled</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {actionError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {actionError}
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
                <th className="text-left px-6 py-4">Candidate</th>
                <th className="text-left px-6 py-4">Job Role</th>
                <th className="text-left px-6 py-4">Qualification</th>
                <th className="text-left px-6 py-4">Skills</th>
                <th className="text-left px-6 py-4">ATS Score</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-center px-6 py-4">Actions</th>
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
                        className={`font-semibold ${
                          candidate.ats_score >= 80 ? "text-green-600" : "text-red-500"
                        }`}
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
                  <td className="px-6 py-5">
  <div className="flex justify-center gap-2 flex-wrap">
    <div className="relative">
      <select
        defaultValue=""
        onChange={(e) => {
          const value = e.target.value;

          if (value === "shortlist") {
            handleStatusChange(candidate, "Shortlisted");
          } else if (value === "reject") {
            handleStatusChange(candidate, "Rejected");
          } else if (value === "interview") {
            setScheduleTarget(candidate);
          }

          e.target.value = "";
        }}
        disabled={actioningId === candidate.id}
        className="w-36 h-18 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium px-3 focus:outline-none focus:border-[#7393D3] hover:border-[#7393D3]"
      >
        <option value="">Actions</option>

        <option
          value="shortlist"
          disabled={candidate.status === "Shortlisted"}
        >
          Shortlist
        </option>

        <option
          value="reject"
          disabled={candidate.status === "Rejected"}
        >
          Reject
        </option>

        <option
          value="interview"
          disabled={candidate.status === "Rejected"}
        >
          {candidate.interview_date
            ? "Reschedule Interview"
            : "Schedule Interview"}
        </option>
      </select>
    </div>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {scheduleTarget && (
        <ScheduleInterviewModal
          applicant={scheduleTarget}
          onClose={() => setScheduleTarget(null)}
          onScheduled={() => {
            setScheduleTarget(null);
            loadApplicants();
          }}
        />
      )}
    </RecruiterDashboardLayout>
  );
}