import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getCandidateAssignmentById } from "../../../services/assessmentService";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const formatDuration = (value) => (value ? `${value} Minutes` : "—");

export default function AssessmentInstructions() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [launching, setLaunching] = useState(false);

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

  const handleLaunch = async () => {
    if (!assignment?.assessment_description) {
      setError("Assessment link is not available for this job.");
      return;
    }

    if (!agreed) {
      setError("Please confirm that you have read and understood all instructions.");
      return;
    }

    setLaunching(true);
    setError("");

    try {
      window.open(assignment.assessment_description, "_blank", "noopener,noreferrer");
      navigate(`/user/assessments/${assignmentId}`);
    } catch (err) {
      setError(err?.message || "Unable to open the external assessment link right now.");
    } finally {
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-700">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-gray-500">Loading assessment instructions...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-700">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
          <Link to="/user/assessments" className="mt-4 inline-block text-[#7393D3] font-semibold">
            ← Back to My Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-700">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)] md:p-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Assessment</p>
          <h1 className="mt-3 text-3xl font-bold text-[#3E3A74] md:text-4xl">{assignment.assessment_title}</h1>
          <p className="mt-2 text-lg text-slate-600">{assignment.company_name || "SHNOOR"}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Duration</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{formatDuration(assignment.duration_minutes)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Assessment Type</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">MCQ</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Available Until</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{formatDate(assignment.scheduled_end)}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-bold text-[#3E3A74]">Assessment Instructions</h2>
          <ul className="mt-5 space-y-3 text-base text-slate-700">
            <li>✓ Webcam access is required</li>
            <li>✓ Microphone access is required</li>
            <li>✓ Full Screen mode is mandatory</li>
            <li>✓ Do not switch browser tabs</li>
            <li>✓ Do not minimize the browser</li>
            <li>✓ Stable internet connection is required</li>
            <li>✓ Copy & Paste is disabled</li>
            <li>✓ Close unnecessary applications before starting</li>
          </ul>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 p-5">
          <label className="flex items-start gap-3 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />
            <span>I have read and understood all instructions.</span>
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link
            to={`/user/assessments/${assignmentId}`}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={handleLaunch}
            disabled={launching}
            className="rounded-xl bg-[#7393D3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5E84D6] disabled:opacity-60"
          >
            {launching ? "Starting..." : "Start Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
