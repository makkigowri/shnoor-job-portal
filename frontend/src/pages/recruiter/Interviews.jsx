import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getInterviews, rescheduleInterview, updateInterviewStatus } from "../../services/recruiterService";
const statusBadge = (status) => {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Cancelled":
      return "bg-red-100 text-red-600";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};
const RescheduleModal = ({ interview, onClose, onSaved }) => {
  const [form, setForm] = useState({
    scheduledDate: interview.scheduled_date ? String(interview.scheduled_date).slice(0, 10) : "",
    scheduledTime: interview.scheduled_time || "",
    mode: interview.mode || "Online",
    locationOrLink: interview.location_or_link || ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await rescheduleInterview(interview.id, form);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to reschedule this interview right now");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-[#3E3A74]">Reschedule Interview</h2>
        <p className="mt-1 text-gray-500">{interview.candidate_name} · {interview.job_title}</p>
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
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 rounded-xl transition disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
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
export default function Interviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const loadInterviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInterviews({ status: statusFilter || undefined });
      setInterviews(data.interviews || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load interviews right now");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);
  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);
  const handleStatusChange = async (interview, status) => {
    setActionError("");
    setActioningId(interview.id);
    try {
      await updateInterviewStatus(interview.id, status);
      setInterviews((prev) =>
        prev.map((item) => (item.id === interview.id ? { ...item, status } : item))
      );
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to update this interview right now");
    } finally {
      setActioningId(null);
    }
  };
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Interviews</h1>
          <p className="mt-2 text-gray-500">Schedule and manage candidate interviews.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
          >
            <option value="">All Status</option>
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <button
            onClick={() => navigate("/recruiter/applicants")}
            className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-6 py-3 rounded-xl transition"
          >
            Schedule Interview
          </button>
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
      {loading && <p className="mt-8 text-gray-500">Loading interviews...</p>}
      {!loading && interviews.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          No interviews scheduled yet. Go to Applicants and click "Interview" on a candidate to schedule one.
        </div>
      )}
      {!loading && interviews.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-4">Candidate</th>
                <th className="text-left px-6 py-4">Job Role</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Time</th>
                <th className="text-left px-6 py-4">Mode</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((item) => (
                <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-gray-900">{item.candidate_name}</div>
                    <div className="text-sm text-gray-500">{item.candidate_email}</div>
                  </td>
                  <td className="px-6 py-5 text-gray-900">{item.job_title}</td>
                  <td className="px-6 py-5 text-gray-900">{String(item.scheduled_date).slice(0, 10)}</td>
                  <td className="px-6 py-5 text-gray-900">{item.scheduled_time}</td>
                  <td className="px-6 py-5 text-gray-900">{item.mode}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2 flex-wrap">
                      {item.status === "Scheduled" && item.mode === "Online" && item.location_or_link && (
                        <a
                          href={item.location_or_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-lg bg-[#7393D3] hover:bg-[#5E84D6] text-white transition"
                        >
                          Join
                        </a>
                      )}
                      {item.status === "Scheduled" && (
                        <>
                          <button
                            onClick={() => setRescheduleTarget(item)}
                            className="px-4 py-2 rounded-lg border border-[#7393D3] text-[#3E3A74] hover:bg-[#7393D3] hover:text-white transition"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleStatusChange(item, "Completed")}
                            disabled={actioningId === item.id}
                            className="px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition disabled:opacity-50"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleStatusChange(item, "Cancelled")}
                            disabled={actioningId === item.id}
                            className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rescheduleTarget && (
        <RescheduleModal
          interview={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSaved={() => {
            setRescheduleTarget(null);
            loadInterviews();
          }}
        />
      )}
    </RecruiterDashboardLayout>
  );
}
