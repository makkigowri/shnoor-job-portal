import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import ResultCard from "../../../components/user/ResultCard";
import SubmissionSummary from "../../../components/user/SubmissionSummary";
import { getMySubmission } from "../../../services/assessmentService";
export default function AssessmentResult() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMySubmission(submissionId);
        setSubmission(data.submission);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load your result right now");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [submissionId]);
  if (loading) {
    return (
      <UserDashboardLayout>
        <p className="text-gray-500">Loading result...</p>
      </UserDashboardLayout>
    );
  }
  if (!submission) {
    return (
      <UserDashboardLayout>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>}
        <Link to="/user/assessments" className="mt-4 inline-block text-[#7393D3] font-semibold">
          ← Back to My Assessments
        </Link>
      </UserDashboardLayout>
    );
  }
  if (submission.status === "In Progress") {
    return (
      <UserDashboardLayout>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-6">
          This assessment is still in progress. Please finish and submit it first.
        </div>
        <Link to="/user/assessments" className="mt-4 inline-block text-[#7393D3] font-semibold">
          ← Back to My Assessments
        </Link>
      </UserDashboardLayout>
    );
  }
  return (
    <UserDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Assessment Result</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={submission.status} />
            {submission.status === "Auto Submitted" && (
              <span className="text-sm text-orange-600">Automatically submitted when time expired</span>
            )}
          </div>
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
      <div className="mt-8">
        <ResultCard submission={submission} />
      </div>
      {submission.result === "Pass" && submission.assignment_id && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-semibold text-emerald-700">You passed! Your AI Interview is now available.</p>
            <p className="text-sm text-emerald-700/80 mt-1">Continue from your Assessment page to start it.</p>
          </div>
          <Link
            to={`/user/assessments/${submission.assignment_id}`}
            className="px-6 py-3 rounded-xl bg-[#3E3A74] text-white font-semibold hover:bg-[#2f2c5c] transition"
          >
            Continue to AI Interview →
          </Link>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-[#3E3A74] mb-5">Answer Summary</h2>
        <SubmissionSummary answers={submission.answers} />
      </div>
    </UserDashboardLayout>
  );
}
