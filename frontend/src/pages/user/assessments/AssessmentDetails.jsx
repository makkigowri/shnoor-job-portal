import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import { getCandidateAssignmentById } from "../../../services/assessmentService";
import { getAiInterviewByApplication } from "../../../services/aiInterviewService";
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "—");
const NEXT_STEP_COPY = {
  Selected: {
    heading: "Congratulations!",
    tone: "emerald",
    status: "Selected",
    nextStep: "A job offer has been sent to your registered email."
  },
  "Technical Interview": {
    heading: "Congratulations!",
    tone: "blue",
    status: "Shortlisted for Technical Interview",
    nextStep: "Our recruitment team will contact you shortly to schedule your Technical Interview."
  },
  Rejected: {
    heading: "Thank you for attending.",
    tone: "red",
    status: "Not Selected",
    nextStep: "Keep an eye on your dashboard for other matching opportunities."
  }
};
export default function AssessmentDetails() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [assignment, setAssignment] = useState(location.state?.assignment || null);
  const [loading, setLoading] = useState(!location.state?.assignment);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [aiInterview, setAiInterview] = useState(null);
  const [aiInterviewLoading, setAiInterviewLoading] = useState(false);
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
  }, [assignmentId]);
  const loadAiInterview = useCallback(async (applicationId) => {
    if (!applicationId) return;
    setAiInterviewLoading(true);
    try {
      const data = await getAiInterviewByApplication(applicationId);
      setAiInterview(data.interview || null);
    } catch (err) {
      setAiInterview(null);
    } finally {
      setAiInterviewLoading(false);
    }
  }, []);
  useEffect(() => {
    if (assignment && assignment.status === "Completed" && assignment.result === "Pass" && assignment.application_id) {
      loadAiInterview(assignment.application_id);
    }
  }, [assignment, loadAiInterview]);
  const handleStart = () => {
    setStarting(true);
    navigate(`/user/assessments/${assignmentId}/take`, { state: { assignment } });
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
      {isCompleted && assignment.result === "Pass" && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#3E3A74] mb-4">AI Interview</h2>
          {aiInterviewLoading && !aiInterview && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-gray-500">
              Preparing your AI Interview...
            </div>
          )}
          {!aiInterviewLoading && !aiInterview && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-gray-500">
              Your AI Interview will appear here shortly.
            </div>
          )}
          {aiInterview && aiInterview.status !== "Completed" && (
            <div className="bg-gradient-to-r from-[#7393D3]/10 to-[#3E3A74]/10 border border-[#7393D3]/30 rounded-2xl px-6 py-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold text-[#3E3A74]">
                  {aiInterview.status === "In Progress" ? "Resume your AI Interview" : "Your AI Interview is ready"}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Congratulations on passing the assessment. Continue to the next step whenever you're ready.
                </p>
              </div>
              <button
                onClick={() => navigate(`/user/ai-interview/${aiInterview.id}`)}
                className="px-6 py-3 rounded-xl bg-[#3E3A74] text-white font-semibold hover:bg-[#2f2c5c] transition"
              >
                {aiInterview.status === "In Progress" ? "Resume AI Interview" : "Start AI Interview"}
              </button>
            </div>
          )}
          {aiInterview && aiInterview.status === "Completed" && (() => {
            const copy = NEXT_STEP_COPY[aiInterview.decision] || NEXT_STEP_COPY.Rejected;
            const isPass = aiInterview.result === "Pass";
            return (
              <div
                className={`rounded-2xl border p-6 ${
                  isPass ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h3 className={`text-lg font-bold ${isPass ? "text-emerald-700" : "text-red-700"}`}>
                    {isPass ? copy.heading : "Thank you for attending."}
                  </h3>
                  <span
                    className={`px-4 py-2 rounded-full font-semibold ${
                      isPass ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isPass ? "PASS" : "FAIL"}
                  </span>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mt-5">
                  <div>
                    <p className="text-sm text-gray-500">Overall Score</p>
                    <p className="text-2xl font-bold text-[#3E3A74] mt-1">
                      {aiInterview.overall_score != null ? `${aiInterview.overall_score}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className="text-lg font-semibold text-[#3E3A74] mt-1">{copy.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Step</p>
                    <p className="text-sm text-gray-700 mt-1">{copy.nextStep}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
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