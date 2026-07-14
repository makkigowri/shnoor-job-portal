import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import {
  getPendingAssessments,
  getUpcomingAssessments,
  getCompletedAssessments
} from "../../../services/assessmentService";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" }
];

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "—");

export default function MyAssessments() {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pendingRes, upcomingRes, completedRes] = await Promise.all([
        getPendingAssessments(),
        getUpcomingAssessments(),
        getCompletedAssessments()
      ]);
      setPending(pendingRes.assessments || []);
      setUpcoming(upcomingRes.assessments || []);
      setCompleted(completedRes.assessments || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load your assessments right now");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const activeList = tab === "pending" ? pending : tab === "upcoming" ? upcoming : completed;

  return (
    <UserDashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#3E3A74]">My Assessments</h1>
        <p className="mt-2 text-gray-500">Attempt assessments assigned to you and track your results.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Pending</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{pending.length}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Upcoming</p>
          <h2 className="text-3xl font-bold mt-2 text-blue-600">{upcoming.length}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Completed</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">{completed.length}</h2>
        </div>
      </div>

      <div className="mt-8 flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 font-medium border-b-2 -mb-px transition ${
              tab === t.key
                ? "border-[#7393D3] text-[#3E3A74]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label} ({t.key === "pending" ? pending.length : t.key === "upcoming" ? upcoming.length : completed.length})
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}

      {loading && <p className="mt-8 text-gray-500">Loading assessments...</p>}

      {!loading && activeList.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          {tab === "pending" && "You have no assessments to attempt right now."}
          {tab === "upcoming" && "No upcoming assessments scheduled."}
          {tab === "completed" && "You haven't completed any assessments yet."}
        </div>
      )}

      {!loading && activeList.length > 0 && (
        <div className="mt-6 space-y-4">
          {activeList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-[#3E3A74]">{item.assessment_title}</h3>
                  {tab === "completed" && <StatusBadge status={item.result} />}
                  {tab !== "completed" && item.submission_status === "In Progress" && (
                    <StatusBadge status="Started" />
                  )}
                </div>
                {item.job_title && (
                  <p className="text-sm text-gray-500 mt-1">
                    Job: {item.job_title}
                    {item.company_name ? ` · ${item.company_name}` : ""}
                  </p>
                )}
                {tab === "pending" && (
                  <p className="text-sm text-gray-500 mt-1">
                    {item.scheduled_end
                      ? `Available until ${formatDateTime(item.scheduled_end)}`
                      : "No submission deadline"}{" "}
                    · {item.duration_minutes} min · {item.total_marks} marks
                  </p>
                )}
                {tab === "upcoming" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Opens {formatDateTime(item.scheduled_start)} · {item.duration_minutes} min ·{" "}
                    {item.total_marks} marks
                  </p>
                )}
                {tab === "completed" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Score: {item.total_score}/{item.max_score} (
                    {item.percentage != null ? `${Number(item.percentage).toFixed(1)}%` : "—"}) · Submitted{" "}
                    {formatDateTime(item.submitted_at)}
                  </p>
                )}
              </div>
              <div>
                {tab === "pending" && (
                  <Link
                    to={`/user/assessments/${item.id}`}
                    state={{ assignment: item }}
                    className="px-5 py-2.5 rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white font-medium transition"
                  >
                    {item.submission_status === "In Progress" ? "Continue" : "View & Start"}
                  </Link>
                )}
                {tab === "upcoming" && (
                  <span className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-500 font-medium">
                    Not yet available
                  </span>
                )}
                {tab === "completed" && item.submission_id && (
                  <Link
                    to={`/user/assessments/result/${item.submission_id}`}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-medium transition"
                  >
                    View Result
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </UserDashboardLayout>
  );
}
