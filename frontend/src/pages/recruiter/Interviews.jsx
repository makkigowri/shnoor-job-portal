import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getRecruiterAiInterviews } from "../../services/aiInterviewService";
const techStatusBadge = (status) => {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-700";
    case "In Progress":
      return "bg-amber-100 text-amber-700";
    case "Awaiting Result":
      return "bg-purple-100 text-purple-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};
const resultBadge = (result) => {
  if (result === "Pass") return "bg-emerald-100 text-emerald-700";
  if (result === "Fail") return "bg-red-100 text-red-600";
  return "bg-gray-100 text-gray-500";
};
const getRowInfo = (row) => {
  const iv = row.aiInterview;
  const tech = row.technicalInterview;
  if (!iv) {
    return {
      assessment: "—",
      stage: "—",
      interviewStatus: "Not Scheduled",
      interviewStatusClass: "bg-gray-100 text-gray-600"
    };
  }
  const assessment = "Passed";
  if (iv.status !== "Completed") {
    return {
      assessment,
      stage: "AI Interview",
      interviewStatus: "Not Scheduled",
      interviewStatusClass: "bg-gray-100 text-gray-600"
    };
  }
  if (iv.decision === "Selected") {
    return {
      assessment,
      stage: "Offer Released",
      interviewStatus: "Not Required",
      interviewStatusClass: "bg-emerald-100 text-emerald-700"
    };
  }
  if (iv.decision === "Rejected") {
    return {
      assessment,
      stage: "Rejected",
      interviewStatus: "Not Scheduled",
      interviewStatusClass: "bg-gray-100 text-gray-600"
    };
  }
  if (!tech) {
    return {
      assessment,
      stage: "Technical Interview Pending",
      interviewStatus: "Not Scheduled",
      interviewStatusClass: "bg-gray-100 text-gray-600"
    };
  }
  if (tech.status === "Scheduled" || tech.status === "In Progress") {
    return {
      assessment,
      stage: `Technical Interview ${tech.status}`,
      interviewStatus: tech.status,
      interviewStatusClass: techStatusBadge(tech.status)
    };
  }
  if (tech.status === "Awaiting Result") {
    return {
      assessment,
      stage: "Technical Interview Completed",
      interviewStatus: "Awaiting Result",
      interviewStatusClass: techStatusBadge("Awaiting Result")
    };
  }
  if (tech.result === "Selected") {
    return {
      assessment,
      stage: "Offer Released",
      interviewStatus: "Completed",
      interviewStatusClass: "bg-emerald-100 text-emerald-700"
    };
  }
  return {
    assessment,
    stage: "Rejected",
    interviewStatus: "Completed",
    interviewStatusClass: "bg-red-100 text-red-600"
  };
};
const STAGE_FILTERS = [
  { key: "", label: "All Stages" },
  { key: "AI Interview", label: "AI Interview" },
  { key: "Technical Interview Pending", label: "Awaiting Schedule" },
  { key: "Technical Interview Scheduled", label: "Technical Interview Scheduled" },
  { key: "Technical Interview In Progress", label: "Technical Interview In Progress" },
  { key: "Technical Interview Completed", label: "Awaiting Result" },
  { key: "Offer Released", label: "Offer Released" },
  { key: "Rejected", label: "Rejected" }
];
const ScheduleInterviewModal = ({ onClose, onSaved }) => {
  const [eligible, setEligible] = useState([]);
  const [loadingEligible, setLoadingEligible] = useState(true);
  const [form, setForm] = useState({
    applicationId: "",
    scheduledDate: "",
    scheduledTime: "",
    durationMinutes: 45,
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("shnoor_token");
    axios.get("http://localhost:5001/api/meeting/eligible", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    .then((res) => {
      if (active) setEligible(res.data.applications || []);
    })
    .catch((err) => {
      if (active) {
        setEligible([
          { application_id: "lana_id", candidate_name: "Lana", job_title: "Java Developer", overall_score: 78, candidate_email: "lana@jobwork.com" }
        ]);
      }
    })
    .finally(() => {
      if (active) setLoadingEligible(false);
    });

    return () => {
      active = false;
    };
  }, []);
  const selectedCandidate = eligible.find((a) => String(a.application_id) === String(form.applicationId));
  const generatedRoomName =
  "room_" + Math.random().toString(36).substring(2, 8);
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  if (!form.applicationId) {
    setError("Select a candidate to schedule");
    return;
  }
  setSubmitting(true);
  try {
    const token = localStorage.getItem("shnoor_token");
    await axios.post(
  "http://localhost:5001/api/interviews",
  {
    applicationId: form.applicationId,
    scheduledDate: form.scheduledDate,
    scheduledTime: form.scheduledTime,
    mode: "Online",
    locationOrLink: generatedRoomName,
    notes: form.notes,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
    onSaved();
  } catch (err) {
    onSaved();
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#3E3A74]">Schedule Technical Interview</h2>
        <p className="mt-1 text-gray-500">
          Candidates who passed the AI Interview with a score between 70% and 84% appear here.
        </p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">{error}</div>
        )}
        {loadingEligible ? (
          <p className="mt-6 text-gray-500">Loading eligible candidates...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="font-medium text-gray-900 text-sm">Candidate</label>
              <select
                value={form.applicationId}
                onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              >
                <option value="">Select a candidate</option>
                {eligible.map((app) => (
                  <option key={app.application_id} value={app.application_id}>
                    {app.candidate_name} · {app.job_title} · {app.overall_score}%
                  </option>
                ))}
              </select>
              {eligible.length === 0 && (
                <p className="mt-2 text-xs text-gray-500">No candidates are currently awaiting scheduling.</p>
              )}
            </div>
            {selectedCandidate && (
              <p className="text-sm text-gray-500">{selectedCandidate.candidate_email}</p>
            )}
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
              <label className="font-medium text-gray-900 text-sm">Duration (minutes)</label>
              <input
                type="number"
                min={15}
                step={5}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-medium text-gray-900 text-sm">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-500">
              A private meeting room is generated automatically and the candidate is emailed the interview details on save.
            </p>
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting || eligible.length === 0}
                className="flex-1 bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 rounded-xl transition disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save Schedule"}
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
        )}
      </div>
    </div>
  );
};
const ReleaseResultModal = ({ interview, onClose, onSaved }) => {
  const [result, setResult] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-[#3E3A74]">Release Technical Interview Result</h2>
        <p className="mt-1 text-gray-500">
          {interview.candidate_name} · {interview.job_title}
        </p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setResult("Selected")}
              className={`flex-1 py-3 rounded-xl font-semibold border transition ${
                result === "Selected"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Selected
            </button>
            <button
              type="button"
              onClick={() => setResult("Rejected")}
              className={`flex-1 py-3 rounded-xl font-semibold border transition ${
                result === "Rejected"
                  ? "bg-red-600 text-white border-red-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Rejected
            </button>
          </div>
          <div>
            <label className="font-medium text-gray-900 text-sm">Feedback (optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500">
            Selecting the candidate releases the offer and emails them automatically.
          </p>
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 rounded-xl transition disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit & Send Email"}
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
export default function Interviews() {
  const navigate = useNavigate();
  const [aiInterviews, setAiInterviews] = useState([]);
  const [technicalInterviews, setTechnicalInterviews] = useState([]);
  const [stageFilter, setStageFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [resultTarget, setResultTarget] = useState(null);
 const loadAll = useCallback(async () => {
  setLoading(true);
  setError("");
  try {
    let aiInterviewsData = [];
    try {
      const aiRes = await getRecruiterAiInterviews();
      aiInterviewsData = aiRes.interviews || [];
    } catch (e) {
      console.log("AI interviews fallback");
    }
    setAiInterviews(aiInterviewsData);
    const token = localStorage.getItem("shnoor_token");
const response = await axios.get(
  "http://localhost:5001/api/interviews",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
    const interviews = (response.data.interviews || []).map(meeting => ({
      ...meeting,
      status: meeting.status || "Scheduled", 
      room_code: meeting.room_code || "test-room" 
    }));
    setTechnicalInterviews(interviews);
  } catch (err) {
    setTechnicalInterviews([]); 
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
    return merged.filter((row) => getRowInfo(row).stage === stageFilter);
  }, [aiInterviews, technicalInterviews, stageFilter]);
  const renderActions = (row) => {
    const iv = row.aiInterview;
    const tech = row.technicalInterview;
    if (!iv || iv.status !== "Completed") {
      return <span className="text-gray-300 text-sm">—</span>;
    }
    if (iv.decision === "Selected") {
      return (
        <span className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-medium text-sm inline-block">
          Job Offer
        </span>
      );
    }
    if (iv.decision === "Rejected") {
      return <span className="text-gray-300 text-sm">—</span>;
    }
    if (!tech) {
      return <span className="text-gray-300 text-sm">—</span>;
    }
   if (tech.status === "Scheduled" || tech.status === "In Progress") {
      return (
        <button
          onClick={() => navigate(`/meeting/${tech.location_or_link}`)} 
          className="px-5 py-2 rounded-lg bg-[#7393D3] hover:bg-[#5E84D6] text-white text-sm font-medium transition"
        >
          Join
        </button>
      );
    }
    if (tech.status === "Awaiting Result") {
      return (
        <button
          onClick={() => setResultTarget(tech)}
          className="px-5 py-2 rounded-lg bg-[#3E3A74] hover:bg-[#2f2c5c] text-white text-sm font-medium transition"
        >
          Release Result
        </button>
      );
    }
    if (tech.status === "Completed") {
      if (tech.result === "Selected") {
        return (
          <span className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-medium text-sm inline-block">
            Job Offer
          </span>
        );
      }
      return <span className="text-gray-300 text-sm">—</span>;
    }
    return <span className="text-gray-300 text-sm">—</span>;
  };
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Interviews</h1>
          <p className="mt-2 text-gray-500">
            AI Interview results and Technical Interview scheduling in one place.
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
            onClick={() => setScheduleOpen(true)}
            className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-6 py-3 rounded-xl transition"
          >
            Schedule Interview
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}
      {loading && <p className="mt-8 text-gray-500">Loading interviews...</p>}
      {!loading && rows.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          No interviews to show yet. Candidates appear here once they complete their AI Interview.
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
                const info = getRowInfo(row);
                return (
                  <tr key={row.key} className="border-t border-gray-200 hover:bg-gray-50 align-top">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-900">{row.candidateName}</div>
                      <div className="text-sm text-gray-500">{row.candidateEmail}</div>
                    </td>
                    <td className="px-6 py-5 text-gray-900">{row.jobTitle}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        {info.assessment}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {iv ? (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${resultBadge(iv.result)}`}>
                          {iv.result === "Pass" ? "PASS" : iv.result === "Fail" ? "FAIL" : "—"}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-gray-900 font-semibold">
                      {iv?.overall_score != null ? `${iv.overall_score}%` : "—"}
                    </td>
                    <td className="px-6 py-5 text-gray-900">{info.stage}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${info.interviewStatusClass}`}>
                        {info.interviewStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">{renderActions(row)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {scheduleOpen && (
        <ScheduleInterviewModal
          onClose={() => setScheduleOpen(false)}
          onSaved={() => {
            setScheduleOpen(false);
            loadAll();
          }}
        />
      )}
      {resultTarget && (
        <ReleaseResultModal
          interview={resultTarget}
          onClose={() => setResultTarget(null)}
          onSaved={() => {
            setResultTarget(null);
            loadAll();
          }}
        />
      )}
    </RecruiterDashboardLayout>
  );
}
