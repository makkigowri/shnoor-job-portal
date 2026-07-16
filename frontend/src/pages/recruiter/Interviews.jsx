import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getInterviews, scheduleInterview, rescheduleInterview, updateInterviewStatus } from "../../services/recruiterService";
import { getRecruiterAiInterviews, getRecruiterAiInterviewDetail } from "../../services/aiInterviewService";

const techStatusBadge = (status) => {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Cancelled":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const aiStatusBadge = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";
    case "In Progress":
      return "bg-yellow-100 text-yellow-700";
    case "Available":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const resultBadge = (result) => {
  if (result === "Pass") return "bg-emerald-100 text-emerald-700";
  if (result === "Fail") return "bg-red-100 text-red-600";
  return "bg-gray-100 text-gray-500";
};

// Overall pipeline stage: Assessment -> AI Interview -> Technical Interview -> Job Offer
const getCurrentStage = (row) => {
  const iv = row.aiInterview;
  const tech = row.technicalInterview;
  if (!iv) {
    return tech ? "Technical Interview" : "—";
  }
  if (iv.status !== "Completed") return "AI Interview";
  if (iv.decision === "Selected") return "Job Offer Sent";
  if (iv.decision === "Technical Interview") {
    if (tech && tech.status === "Completed") return "Technical Interview Completed";
    if (tech) return "Technical Interview Scheduled";
    return "Technical Interview Pending";
  }
  return "Rejected";
};

const STAGE_FILTERS = [
  { key: "", label: "All Stages" },
  { key: "AI Interview", label: "AI Interview" },
  { key: "Technical Interview Pending", label: "Awaiting Schedule" },
  { key: "Technical Interview Scheduled", label: "Technical Interview" },
  { key: "Job Offer Sent", label: "Job Offer Sent" },
  { key: "Rejected", label: "Rejected" }
];

// Schedules or reschedules a Technical Interview. Reuses the existing
// /interviews endpoints - no backend changes required.
const ScheduleModal = ({ row, onClose, onSaved }) => {
  const existing = row.technicalInterview;
  const [form, setForm] = useState({
    scheduledDate: existing?.scheduled_date ? String(existing.scheduled_date).slice(0, 10) : "",
    scheduledTime: existing?.scheduled_time || "",
    mode: existing?.mode || "Online",
    locationOrLink: existing?.location_or_link || "",
    notes: existing?.notes || ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (existing) {
        await rescheduleInterview(existing.id, form);
      } else {
        await scheduleInterview({ applicationId: row.applicationId, ...form });
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save this interview right now");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-[#3E3A74]">
          {existing ? "Reschedule Interview" : "Schedule Technical Interview"}
        </h2>
        <p className="mt-1 text-gray-500">
          {row.candidateName} · {row.jobTitle}
        </p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-900 text-sm">Date</label>
              <input
                type="date"
                required
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-gray-900 text-sm">Time</label>
              <input
                type="time"
                required
                value={form.scheduledTime}
                onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="font-medium text-gray-900 text-sm">Mode</label>
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            >
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>
          <div>
            <label className="font-medium text-gray-900 text-sm">
              {form.mode === "Online" ? "Meeting Link" : "Location"}
            </label>
            <input
              type="text"
              value={form.locationOrLink}
              onChange={(e) => setForm({ ...form, locationOrLink: e.target.value })}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 rounded-xl transition disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Full AI Interview evaluation - recruiter-only view (score breakdown, strengths,
// weaknesses, suggestions and complete transcript).
const AiEvaluationModal = ({ interviewId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getRecruiterAiInterviewDetail(interviewId)
      .then((data) => {
        if (active) setDetail(data.interview);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || "Unable to load this AI evaluation right now");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [interviewId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#3E3A74]">Complete AI Evaluation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>

        {loading && <p className="mt-6 text-gray-500">Loading evaluation...</p>}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
        )}

        {detail && (
          <>
            <p className="mt-1 text-gray-500">
              {detail.candidate_name} · {detail.job_title}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-bold text-[#3E3A74]">
                {detail.overall_score != null ? `${detail.overall_score}%` : "-"}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${resultBadge(detail.result)}`}>
                {detail.result === "Pass" ? "PASS" : "FAIL"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <ScoreCell label="Technical" value={detail.technical_score} />
              <ScoreCell label="Communication" value={detail.communication_score} />
              <ScoreCell label="Confidence" value={detail.confidence_score} />
              <ScoreCell label="Problem Solving" value={detail.problem_solving_score} />
            </div>

            {detail.ai_feedback && (
              <p className="mt-5 text-sm text-gray-700 bg-[#EEF2FF] rounded-xl px-4 py-3">{detail.ai_feedback}</p>
            )}

            <div className="grid gap-4 mt-5">
              <div>
                <p className="text-sm font-semibold text-[#3E3A74]">Strengths</p>
                <p className="text-sm text-gray-600 mt-1">{detail.strengths || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3E3A74]">Weaknesses</p>
                <p className="text-sm text-gray-600 mt-1">{detail.weaknesses || "—"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3E3A74]">Suggestions</p>
                <p className="text-sm text-gray-600 mt-1">{detail.suggestions || "—"}</p>
              </div>
            </div>

            {Array.isArray(detail.questions) && detail.questions.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-[#3E3A74] mb-3">Transcript</p>
                <div className="space-y-3 border border-gray-200 rounded-xl p-4">
                  {detail.questions.map((q) => (
                    <div key={q.id} className="text-sm">
                      <p className="font-medium text-[#3E3A74]">Q: {q.question_text}</p>
                      <p className="text-gray-600 mt-1">A: {q.candidate_answer || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const ScoreCell = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 p-3 text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-bold text-[#3E3A74] mt-1">{value != null ? `${value}%` : "—"}</p>
  </div>
);

export default function Interviews() {
  const navigate = useNavigate();
  const [aiInterviews, setAiInterviews] = useState([]);
  const [technicalInterviews, setTechnicalInterviews] = useState([]);
  const [stageFilter, setStageFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [evaluationTarget, setEvaluationTarget] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [aiRes, techRes] = await Promise.all([getRecruiterAiInterviews(), getInterviews()]);
      setAiInterviews(aiRes.interviews || []);
      setTechnicalInterviews(techRes.interviews || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load interviews right now");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const rows = useMemo(() => {
    const techByApplication = new Map(technicalInterviews.map((t) => [t.application_id, t]));
    const covered = new Set();
    const merged = aiInterviews.map((iv) => {
      covered.add(iv.application_id);
      return {
        key: `ai-${iv.id}`,
        applicationId: iv.application_id,
        candidateName: iv.candidate_name,
        candidateEmail: iv.candidate_email,
        jobTitle: iv.job_title,
        aiInterview: iv,
        technicalInterview: techByApplication.get(iv.application_id) || null
      };
    });
    technicalInterviews
      .filter((t) => !covered.has(t.application_id))
      .forEach((t) => {
        merged.push({
          key: `tech-${t.id}`,
          applicationId: t.application_id,
          candidateName: t.candidate_name,
          candidateEmail: t.candidate_email,
          jobTitle: t.job_title,
          aiInterview: null,
          technicalInterview: t
        });
      });
    if (!stageFilter) return merged;
    return merged.filter((row) => getCurrentStage(row) === stageFilter);
  }, [aiInterviews, technicalInterviews, stageFilter]);

  const handleStatusChange = async (technicalInterview, status) => {
    setActionError("");
    setActioningId(technicalInterview.id);
    try {
      await updateInterviewStatus(technicalInterview.id, status);
      setTechnicalInterviews((prev) =>
        prev.map((item) => (item.id === technicalInterview.id ? { ...item, status } : item))
      );
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to update this interview right now");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Interviews</h1>
          <p className="mt-2 text-gray-500">
            Assessment status, AI Interview results and Technical Interview scheduling in one place.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
          >
            {STAGE_FILTERS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate("/recruiter/applicants")}
            className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-6 py-3 rounded-xl transition"
          >
            Schedule Interview
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      {actionError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{actionError}</div>
      )}

      {loading && <p className="mt-8 text-gray-500">Loading interviews...</p>}

      {!loading && rows.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          No interviews to show yet. Candidates appear here once they pass their assessment or have an interview
          scheduled.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-4">Candidate</th>
                <th className="text-left px-6 py-4">Job</th>
                <th className="text-left px-6 py-4">Assessment</th>
                <th className="text-left px-6 py-4">AI Interview</th>
                <th className="text-left px-6 py-4">AI Score</th>
                <th className="text-left px-6 py-4">Current Stage</th>
                <th className="text-left px-6 py-4">Interview Status</th>
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const iv = row.aiInterview;
                const tech = row.technicalInterview;
                const stage = getCurrentStage(row);
                return (
                  <tr key={row.key} className="border-t border-gray-200 hover:bg-gray-50 align-top">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-900">{row.candidateName}</div>
                      <div className="text-sm text-gray-500">{row.candidateEmail}</div>
                    </td>
                    <td className="px-6 py-5 text-gray-900">{row.jobTitle}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        {iv ? "Passed" : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {iv ? (
                        <div className="flex flex-wrap gap-2">
                         {iv && (
  <span
    className={`px-3 py-1 rounded-full text-sm font-medium ${
      resultBadge(iv.result)
    }`}
  >
    {iv.result === "Pass" ? "PASS" : "FAIL"}
  </span>
)}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-gray-900 font-semibold">
                      {iv?.overall_score != null ? `${iv.overall_score}%` : "—"}
                    </td>
                    <td className="px-6 py-5 text-gray-900">{stage}</td>
                    <td className="px-6 py-5">
                      {tech ? (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${techStatusBadge(tech.status)}`}>
                          {tech.status}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not Scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2 flex-wrap max-w-xs">
                        {iv && iv.status === "Completed" && (
                          <button
                            onClick={() => setEvaluationTarget(iv)}
                            className="px-4 py-2 rounded-lg border border-[#7393D3] text-[#3E3A74] hover:bg-[#7393D3] hover:text-white transition"
                          >
                            View AI Evaluation
                          </button>
                        )}

                        {iv?.decision === "Selected" && (
                          <span className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-medium text-sm">
                            Job Offer Sent
                          </span>
                        )}

                        {(!iv || iv.decision === "Technical Interview") && !tech && (
                          <button
                            onClick={() => setScheduleTarget(row)}
                            className="px-4 py-2 rounded-lg bg-[#7393D3] hover:bg-[#5E84D6] text-white transition"
                          >
                            Schedule Technical Interview
                          </button>
                        )}

                        {tech && tech.status === "Scheduled" && tech.mode === "Online" && tech.location_or_link && (
                          <a
                            href={tech.location_or_link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-lg bg-[#7393D3] hover:bg-[#5E84D6] text-white transition"
                          >
                            Join
                          </a>
                        )}
                        {tech && tech.status === "Scheduled" && (
                          <>
                            <button
                              onClick={() => setScheduleTarget(row)}
                              className="px-4 py-2 rounded-lg border border-[#7393D3] text-[#3E3A74] hover:bg-[#7393D3] hover:text-white transition"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleStatusChange(tech, "Completed")}
                              disabled={actioningId === tech.id}
                              className="px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition disabled:opacity-50"
                            >
                              Mark Completed
                            </button>
                            <button
                              onClick={() => handleStatusChange(tech, "Cancelled")}
                              disabled={actioningId === tech.id}
                              className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {scheduleTarget && (
        <ScheduleModal
          row={scheduleTarget}
          onClose={() => setScheduleTarget(null)}
          onSaved={() => {
            setScheduleTarget(null);
            loadAll();
          }}
        />
      )}

      {evaluationTarget && (
        <AiEvaluationModal interviewId={evaluationTarget.id} onClose={() => setEvaluationTarget(null)} />
      )}
    </RecruiterDashboardLayout>
  );
}
