import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import useAuth from "../../../hooks/useAuth";
import {
  getPendingAssessments,
  getUpcomingAssessments,
  getCompletedAssessments
} from "../../../services/assessmentService";
const formatDateTime = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};
const candidateCardTitle = (item) => item.job_title || item.assessment_title || "Assessment";
export default function MyAssessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
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
      const items = [
        ...(pendingRes.assessments || []),
        ...(upcomingRes.assessments || []),
        ...(completedRes.assessments || [])
      ];
      setAssessments(items);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load your assessments right now");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadAll();
  }, [loadAll]);
  const candidateName = user?.fullname || "Candidate";
  return (
    <UserDashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#3E3A74]">My Assessments</h1>
        <p className="mt-2 text-gray-500">
          Only shortlisted jobs appear here. Open the assessment link after reviewing the instructions.
        </p>
      </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      {loading && <p className="mt-8 text-gray-500">Loading your assessments...</p>}
      {!loading && assessments.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          No shortlisted assessments are available right now.
        </div>
      )}
      {!loading && assessments.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {assessments.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Candidate</p>
                  <h2 className="text-xl font-bold text-[#3E3A74] mt-1">{candidateName}</h2>
                  <p className="text-gray-600 mt-4 font-semibold">{candidateCardTitle(item)}</p>
                  {item.company_name && <p className="text-sm text-gray-500 mt-1">{item.company_name}</p>}
                  {item.scheduled_end && (
                    <p className="text-xs text-gray-400 mt-2">Available until {formatDateTime(item.scheduled_end)}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 rounded-xl bg-[#F7F9FF] border border-[#DCE6FF] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assessment Link</p>
                <p className="mt-2 text-sm text-[#3E3A74] break-all">{item.assessment_description || "No link configured yet."}</p>
              </div>
              <div className="mt-6">
                <Link
                  to={`/user/assessments/${item.id}`}
                  className="inline-flex items-center justify-center rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white px-6 py-3 font-semibold transition"
                >
                  Open Assessment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserDashboardLayout>
  );
}