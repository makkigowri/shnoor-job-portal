import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import ResultTable from "../../../components/recruiter/ResultTable";
import { getAssessmentById, getAssessmentResults, getSubmissionDetail } from "../../../services/assessmentService";
const SubmissionDetailModal = ({ submission, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#3E3A74]">{submission.candidate_name}</h2>
          <p className="mt-1 text-gray-500">{submission.candidate_email}</p>
        </div>
        <StatusBadge status={submission.result} />
      </div>
      <p className="mt-3 text-gray-700">
        Score: <span className="font-semibold">{submission.total_score}</span> / {submission.max_score} (
        {submission.percentage != null ? `${Number(submission.percentage).toFixed(1)}%` : "—"})
      </p>
      <div className="mt-6 space-y-4">
        {(submission.answers || []).map((ans, i) => (
          <div key={ans.id || i} className="border border-gray-200 rounded-xl p-4">
            <p className="font-medium text-gray-900">
              {i + 1}. {ans.question_text}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Candidate's Answer: <span className="font-medium text-gray-900">{ans.answer_text || "—"}</span>
            </p>
            {ans.correct_answer && (
              <p className="mt-1 text-sm text-gray-600">
                Correct Answer: <span className="font-medium text-green-700">{ans.correct_answer}</span>
              </p>
            )}
            <p className="mt-1 text-sm text-gray-600">
              Marks Awarded:{" "}
              <span className="font-medium text-gray-900">
                {ans.marks_awarded ?? 0} / {ans.question_marks}
              </span>
            </p>
          </div>
        ))}
        {(!submission.answers || submission.answers.length === 0) && (
          <p className="text-gray-500">No answers recorded for this submission.</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
      >
        Close
      </button>
    </div>
  </div>
);
export default function AssessmentResults() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [assessmentData, resultsData] = await Promise.all([
          getAssessmentById(id),
          getAssessmentResults(id)
        ]);
        setAssessment(assessmentData.assessment);
        setResults(resultsData.results || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load results right now");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);
  const handleViewDetail = async (submissionId) => {
    setDetailLoading(true);
    try {
      const data = await getSubmissionDetail(submissionId);
      setDetail(data.submission);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load submission details right now");
    } finally {
      setDetailLoading(false);
    }
  };
  const passCount = results.filter((r) => r.result === "Pass").length;
  const failCount = results.filter((r) => r.result === "Fail").length;
  const avgScore =
    results.length > 0
      ? (results.reduce((sum, r) => sum + Number(r.total_score || 0), 0) / results.length).toFixed(1)
      : 0;
  if (loading) {
    return (
      <RecruiterDashboardLayout>
        <p className="text-gray-500">Loading results...</p>
      </RecruiterDashboardLayout>
    );
  }
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-[#3E3A74]">Assessment Results</h1>
            {assessment && <StatusBadge status={assessment.status} />}
          </div>
          <p className="mt-2 text-gray-500">{assessment?.title}</p>
        </div>
        <Link
          to={`/recruiter/assessments/${id}`}
          className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Back to Details
        </Link>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Submissions</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{results.length}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Passed</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">{passCount}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Failed</p>
          <h2 className="text-3xl font-bold mt-2 text-red-500">{failCount}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Average Score</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{avgScore}</h2>
        </div>
      </div>
      <div className="mt-8">
        {results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
            No submissions yet. Results will appear here once candidates complete this assessment.
          </div>
        ) : (
          <ResultTable results={results} onViewDetail={handleViewDetail} />
        )}
      </div>

      {detailLoading && <p className="mt-4 text-gray-500">Loading submission...</p>}
      {detail && <SubmissionDetailModal submission={detail} onClose={() => setDetail(null)} />}
    </RecruiterDashboardLayout>
  );
}
