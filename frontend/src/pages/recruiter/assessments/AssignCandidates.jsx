import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import RecruiterDashboardLayout from "../../../layouts/RecruiterDashboardLayout";
import CandidateSelector from "../../../components/recruiter/CandidateSelector";
import StatusBadge from "../../../components/recruiter/StatusBadge";
import { getAssessmentById, assignAssessment, getAssignedCandidates } from "../../../services/assessmentService";
import { getApplicants } from "../../../services/recruiterService";
export default function AssignCandidates() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [assignedCandidates, setAssignedCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const assessmentData = await getAssessmentById(id);
      const a = assessmentData.assessment;
      setAssessment(a);
      const [applicantsData, assignedData] = await Promise.all([
        getApplicants({ status: "Shortlisted", jobId: a.job_id || undefined }),
        getAssignedCandidates(id)
      ]);
      setCandidates(applicantsData.applicants || []);
      setAssignedCandidates(assignedData.candidates || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load candidates right now");
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);
  const toggleCandidate = (candidateId) => {
    setSelectedIds((prev) =>
      prev.includes(candidateId) ? prev.filter((cid) => cid !== candidateId) : [...prev, candidateId]
    );
  };
  const toggleAll = (allIds) => {
    setSelectedIds((prev) => (prev.length === allIds.length ? [] : allIds));
  };
  const alreadyAssignedIds = assignedCandidates.map((a) => a.candidate_id);
  const handleAssign = async () => {
    setError("");
    setSuccess("");
    if (selectedIds.length === 0) {
      setError("Select at least one candidate to assign");
      return;
    }
    setSubmitting(true);
    try {
      const data = await assignAssessment(id, {
        candidateIds: selectedIds,
        scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : undefined,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd).toISOString() : undefined
      });
      setSuccess(data.message || "Candidates assigned successfully");
      setSelectedIds([]);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to assign candidates right now");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <RecruiterDashboardLayout>
        <p className="text-gray-500">Loading...</p>
      </RecruiterDashboardLayout>
    );
  }
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-[#3E3A74]">Assign Candidates</h1>
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
      {assessment?.status !== "Published" && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3">
          This assessment is not published yet. Candidates cannot attempt it until you publish it, but you can still assign them now.
        </div>
      )}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">{success}</div>
      )}
      <div className="bg-white mt-8 rounded-2xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-semibold text-[#3E3A74]">Scheduling Window (optional)</h2>
        <p className="mt-1 text-sm text-gray-500">
          Leave blank to allow candidates to attempt the assessment anytime after it is published.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="font-medium text-gray-900 text-sm">Available From</label>
            <input
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
          <div>
            <label className="font-medium text-gray-900 text-sm">Available Until</label>
            <input
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-[#3E3A74] mb-4">
          Shortlisted Candidates {assessment?.job_title ? `for ${assessment.job_title}` : ""}
        </h2>
        <CandidateSelector
          candidates={candidates}
          selectedIds={selectedIds}
          onToggle={toggleCandidate}
          onToggleAll={toggleAll}
          alreadyAssignedIds={alreadyAssignedIds}
        />
      </div>
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleAssign}
          disabled={submitting}
          className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60"
        >
          {submitting ? "Assigning..." : `Assign ${selectedIds.length || ""} Candidate${selectedIds.length === 1 ? "" : "s"}`}
        </button>
        <button
          onClick={() => navigate(`/recruiter/assessments/${id}`)}
          className="px-8 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Done
        </button>
      </div>
      {assignedCandidates.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-[#3E3A74] mb-4">Already Assigned ({assignedCandidates.length})</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4">Candidate</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {assignedCandidates.map((a) => (
                  <tr key={a.id} className="border-t border-gray-200">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{a.candidate_name}</div>
                      <div className="text-sm text-gray-500">{a.candidate_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {a.total_score != null ? `${a.total_score} / ${a.max_score}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </RecruiterDashboardLayout>
  );
}
