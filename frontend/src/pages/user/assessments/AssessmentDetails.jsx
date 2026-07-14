import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import { getCandidateAssignmentById, startCandidateAssessment } from "../../../services/assessmentService";

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "—");

export default function AssessmentDetails() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [assignment, setAssignment] = useState(location.state?.assignment || null);
  const [loading, setLoading] = useState(!location.state?.assignment);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (assignment) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      await startCandidateAssessment(assignmentId);
      navigate(`/user/assessments/${assignmentId}/take`, { state: { assignment } });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to start this assessment right now");
      setStarting(false);
    }
  };

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

  const alreadyInProgress = assignment.submission_status === "In Progress";
  const isCompleted = assignment.status === "Completed";

  return (
    <UserDashboardLayout>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold text-[#3E3A74]">{assignment.assessment_title}</h1>
            <StatusBadge status={assignment.status} />
          </div>
          <p className="mt-2 text-gray-500">
            {assignment.job_title ? `For job: ${assignment.job_title}` : "General assessment"}
          </p>
        </div>
        <Link
          to="/user/assessments"
          className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          All Assessments
        </Link>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Duration</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{assignment.duration_minutes}m</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Total Marks</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{assignment.total_marks}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Passing Marks</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{assignment.passing_marks}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Available Until</p>
          <h2 className="text-lg font-bold mt-2 text-[#3E3A74]">{formatDateTime(assignment.scheduled_end)}</h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-8">
        <h2 className="text-xl font-semibold text-[#3E3A74]">Description</h2>
        <p className="mt-3 text-gray-700 whitespace-pre-line">
          {assignment.assessment_description || "No description provided."}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-6 mt-8">
        <h3 className="font-semibold">Before you begin</h3>
        <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
          <li>The timer starts as soon as you click "Start Assessment" and cannot be paused.</li>
          <li>Your answers are auto-saved periodically while you work.</li>
          <li>If time runs out, the assessment will be submitted automatically with your current answers.</li>
          <li>You can navigate between questions freely using the question palette.</li>
        </ul>
      </div>

      <div className="mt-8 flex justify-end">
        {isCompleted ? (
          <span className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-medium">
            This assessment has already been completed.
          </span>
        ) : (
          <button
            onClick={handleStart}
            disabled={starting}
            className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {starting ? "Starting..." : alreadyInProgress ? "Continue Assessment" : "Start Assessment"}
          </button>
        )}
      </div>
    </UserDashboardLayout>
  );
}
