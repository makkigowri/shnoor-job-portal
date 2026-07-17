import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import QuestionCard from "../../../components/recruiter/QuestionCard";
import {
  getAssessmentById,
  publishAssessment,
  closeAssessment,
  deleteAssessment
} from "../../../services/assessmentService";
export default function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAssessmentById(id);
      setAssessment(data.assessment);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load this assessment right now");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handlePublish = async () => {
    setActionLoading(true);
    setError("");
    try {
      await publishAssessment(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to publish this assessment right now");
    } finally {
      setActionLoading(false);
    }
  };
  const handleClose = async () => {
    if (!window.confirm("Close this assessment? Candidates will no longer be able to attempt it.")) return;
    setActionLoading(true);
    setError("");
    try {
      await closeAssessment(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to close this assessment right now");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this assessment? This cannot be undone.")) return;
    setActionLoading(true);
    setError("");
    try {
      await deleteAssessment(id);
      navigate("/recruiter/assessments");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete this assessment right now");
      setActionLoading(false);
    }
  };
  if (loading) {
    return (
      <RecruiterDashboardLayout>
        <p className="text-gray-500">Loading assessment...</p>
      </RecruiterDashboardLayout>
    );
  }
  if (!assessment) {
    return (
      <RecruiterDashboardLayout>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>}
      </RecruiterDashboardLayout>
    );
  }
  const questions = assessment.questions || [];
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold text-[#3E3A74]">{assessment.title}</h1>
            <StatusBadge status={assessment.status} />
          </div>
          <p className="mt-2 text-gray-500">
            {assessment.job_title ? `Linked Job: ${assessment.job_title}` : "Not linked to a specific job"}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/recruiter/assessments"
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            All Assessments
          </Link>
          <Link
            to={`/recruiter/assessments/${id}/edit`}
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Edit
          </Link>
          <Link
            to={`/recruiter/assessments/${id}/results`}
            className="px-5 py-2.5 rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white transition"
          >
            View Results
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Questions</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{questions.length}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Total Marks</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{assessment.total_marks}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Duration</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{assessment.duration_minutes}m</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Assigned</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{assessment.assigned_count ?? 0}</h2>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#3E3A74]">Description</h2>
          <p className="mt-3 text-gray-700 whitespace-pre-line">{assessment.description || "No description provided."}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#3E3A74]">Instructions for Candidates</h2>
          <p className="mt-3 text-gray-700 whitespace-pre-line">{assessment.instructions || "No instructions provided."}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-8">
        <h2 className="text-xl font-semibold text-[#3E3A74]">Passing Criteria</h2>
        <p className="mt-3 text-gray-700">
          Candidates need at least <span className="font-semibold">{assessment.passing_marks}</span> out of{" "}
          <span className="font-semibold">{assessment.total_marks}</span> marks to pass.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-semibold text-[#3E3A74]">Questions Preview</h2>
          <Link to={`/recruiter/assessments/${id}/edit`} className="text-[#7393D3] font-semibold">
            Manage Questions →
          </Link>
        </div>
        <div className="mt-5 space-y-4">
          {questions.length === 0 && (
            <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
              No questions added yet.
            </div>
          )}
          {questions.map((q, i) => (
            <QuestionCard key={q.id || i} question={q} index={i} />
          ))}
        </div>
      </div>
      <div className="mt-10 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-wrap gap-4">
        {assessment.status === "Draft" && (
          <button
            onClick={handlePublish}
            disabled={actionLoading}
            className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-6 py-3 rounded-xl transition disabled:opacity-60"
          >
            {actionLoading ? "Publishing..." : "Publish Assessment"}
          </button>
        )}
        {assessment.status === "Published" && (
          <button
            onClick={handleClose}
            disabled={actionLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl transition disabled:opacity-60"
          >
            {actionLoading ? "Closing..." : "Close Assessment"}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={actionLoading}
          className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3 rounded-xl transition disabled:opacity-60"
        >
          Delete Assessment
        </button>
      </div>
    </RecruiterDashboardLayout>
  );
}
