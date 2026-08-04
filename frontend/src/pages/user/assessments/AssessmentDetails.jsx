import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import { getCandidateAssignmentById } from "../../../services/assessmentService";
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";
const formatDuration = (value) => {
  if (!value) return "—";
  return `${value} Minutes`;
};
export default function AssessmentDetails() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const found = await getCandidateAssignmentById(assignmentId);
        if (!found) {
          setError("This assessment is no longer available or was not found.");
        } else {
          setAssignment(found);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load this assessment right now");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignmentId]);
  if (loading) {
    return (
      <UserDashboardLayout>
        <p className="text-gray-500">Loading assessment...</p>
      </UserDashboardLayout>
    );
  }
  if (!assignment) {
    return (
      <UserDashboardLayout>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>}
        <Link to="/user/assessments" className="mt-4 inline-block text-[#7393D3] font-semibold">
          ← Back to My Assessments
        </Link>
      </UserDashboardLayout>
    );
  }
  const availableFrom = formatDate(assignment.scheduled_start || assignment.assigned_at);
  const availableUntil = formatDate(assignment.scheduled_end);
  const duration = formatDuration(assignment.duration_minutes);
  return (
    <UserDashboardLayout>
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-8 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Assessment</p>
              <h1 className="mt-3 text-3xl font-bold text-[#3E3A74] md:text-4xl">{assignment.assessment_title}</h1>
              <p className="mt-2 text-lg text-slate-600">{assignment.company_name || "SHNOOR"}</p>
            </div>
            <Link
              to="/user/assessments"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to My Assessments
            </Link>
          </div>
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assessment Status</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{assignment.status || "Assigned"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assessment Link</p>
              <p className="mt-2 break-all text-lg font-semibold text-slate-900">{assignment.assessment_description || "—"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Available From</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{availableFrom}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Available Until</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{availableUntil}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Duration</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{duration}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assessment Type</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">MCQ</p>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/user/assessments/${assignmentId}/instructions`)}
              className="rounded-xl bg-[#7393D3] px-8 py-3 text-base font-semibold text-white transition hover:bg-[#5E84D6]"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}