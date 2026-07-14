import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import AssessmentTable from "../../../components/recruiter/AssessmentTable";
import {
  getAssessments,
  publishAssessment,
  closeAssessment,
  deleteAssessment
} from "../../../services/assessmentService";

export default function AssessmentDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const loadAssessments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAssessments({ status: statusFilter || undefined });
      setAssessments(data.assessments || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load assessments right now");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const summary = {
    total: assessments.length,
    draft: assessments.filter((a) => a.status === "Draft").length,
    published: assessments.filter((a) => a.status === "Published").length,
    closed: assessments.filter((a) => a.status === "Closed").length
  };

  const handlePublish = async (id) => {
    setActionError("");
    setActioningId(id);
    try {
      await publishAssessment(id);
      await loadAssessments();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to publish this assessment right now");
    } finally {
      setActioningId(null);
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm("Close this assessment? Candidates will no longer be able to attempt it.")) return;
    setActionError("");
    setActioningId(id);
    try {
      await closeAssessment(id);
      await loadAssessments();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to close this assessment right now");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assessment? This cannot be undone.")) return;
    setActionError("");
    setActioningId(id);
    try {
      await deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to delete this assessment right now");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Assessment Dashboard</h1>
          <p className="mt-2 text-gray-500">Create, manage and track candidate assessments.</p>
        </div>
        <Link
          to="/recruiter/assessments/create"
          className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-6 py-3 rounded-xl transition"
        >
          + Create Assessment
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Total</p>
          <h2 className="text-3xl font-bold mt-2 text-[#3E3A74]">{summary.total}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Draft</p>
          <h2 className="text-3xl font-bold mt-2 text-gray-600">{summary.draft}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Published</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">{summary.published}</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Closed</p>
          <h2 className="text-3xl font-bold mt-2 text-red-500">{summary.closed}</h2>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 mt-8">
        <h2 className="text-2xl font-semibold text-[#3E3A74]">All Assessments</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      {actionError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{actionError}</div>
      )}

      {loading && <p className="mt-8 text-gray-500">Loading assessments...</p>}

      {!loading && assessments.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          No assessments yet. Create your first assessment to start screening candidates.
        </div>
      )}

      {!loading && assessments.length > 0 && (
        <div className="mt-8">
          <AssessmentTable
            assessments={assessments}
            onPublish={handlePublish}
            onClose={handleClose}
            onDelete={handleDelete}
            actioningId={actioningId}
          />
        </div>
      )}
    </RecruiterDashboardLayout>
  );
}
