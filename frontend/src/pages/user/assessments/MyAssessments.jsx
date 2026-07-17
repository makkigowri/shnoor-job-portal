import { useEffect, useState, useCallback } from "react";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import useAuth from "../../../hooks/useAuth";
import { getMyApplications } from "../../../services/applicationService";
import {
  getPendingAssessments,
  getUpcomingAssessments,
  getCompletedAssessments
} from "../../../services/assessmentService";
import { getMyAiInterviews } from "../../../services/aiInterviewService";
import { getMyTechnicalInterviews } from "../../../services/technicalInterviewService";

const formatDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

const formatDateTime = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const roundScore = (value) => {
  if (value == null || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return Math.round(num);
};

const TONE = {
  green: {
    circle: "bg-emerald-500 border-emerald-500 text-white",
    ring: "ring-emerald-100",
    line: "bg-emerald-400",
    label: "text-emerald-700",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200"
  },
  blue: {
    circle: "bg-[#7393D3] border-[#7393D3] text-white",
    ring: "ring-[#7393D3]/20",
    line: "bg-gray-200",
    label: "text-[#3E3A74]",
    pill: "bg-blue-50 text-blue-700 border border-blue-200"
  },
  gray: {
    circle: "bg-white border-gray-300 text-gray-300",
    ring: "ring-transparent",
    line: "bg-gray-200",
    label: "text-gray-400",
    pill: "bg-gray-100 text-gray-600 border border-gray-200"
  },
  red: {
    circle: "bg-red-500 border-red-500 text-white",
    ring: "ring-red-100",
    line: "bg-red-300",
    label: "text-red-600",
    pill: "bg-red-50 text-red-600 border border-red-200"
  },
  amber: {
    circle: "bg-amber-500 border-amber-500 text-white",
    ring: "ring-amber-100",
    line: "bg-amber-300",
    label: "text-amber-700",
    pill: "bg-amber-50 text-amber-700 border border-amber-200"
  },
  purple: {
    pill: "bg-purple-50 text-purple-700 border border-purple-200"
  }
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DotIcon = () => <span className="w-2.5 h-2.5 rounded-full bg-white block" />;

const DashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <path d="M6 12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const StatusPill = ({ label, tone = "gray", large = false }) => (
  <span
    className={`inline-flex items-center rounded-full font-semibold ${TONE[tone].pill} ${
      large ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs"
    }`}
  >
    {label}
  </span>
);

const StageIcon = ({ state }) => {
  if (state === "completed") return <CheckIcon />;
  if (state === "rejected") return <CrossIcon />;
  if (state === "skipped") return <DashIcon />;
  if (state === "current") return <DotIcon />;
  return <span className="w-2 h-2 rounded-full bg-gray-300 block" />;
};

const StageNode = ({ stage, isLast }) => {
  const [open, setOpen] = useState(false);
  const tone = TONE[stage.tone];
  return (
    <div className="relative flex md:flex-1 items-start md:items-center gap-4 md:gap-0">
      <div className="flex md:flex-col items-center md:flex-1 gap-4 md:gap-3 relative">
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={() => setOpen((prev) => !prev)}
          className="relative cursor-pointer select-none"
        >
          <div
            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shadow-sm transition-all duration-300 ring-4 ${tone.circle} ${tone.ring}`}
          >
            <StageIcon state={stage.state} />
          </div>
          {open && stage.popover && (
            <div className="absolute z-30 top-14 left-1/2 -translate-x-1/2 md:top-14 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{stage.label}</p>
              {stage.popover}
            </div>
          )}
        </div>
        <div className="md:text-center">
          <p className={`text-sm font-semibold ${tone.label}`}>{stage.label}</p>
          {stage.dateLabel && <p className="text-xs text-gray-400 mt-0.5">{stage.dateLabel}</p>}
          {stage.subLabel && <p className={`text-xs mt-1 font-medium ${tone.label}`}>{stage.subLabel}</p>}
        </div>
      </div>
      {!isLast && (
        <>
          <div className={`hidden md:block flex-1 h-0.5 mx-2 self-center rounded-full ${tone.line}`} />
          <div className={`md:hidden absolute left-[21px] top-11 w-0.5 h-full ${tone.line}`} />
        </>
      )}
    </div>
  );
};

const Timeline = ({ stages }) => (
  <div className="mt-10 flex flex-col md:flex-row gap-8 md:gap-0">
    {stages.map((stage, index) => (
      <StageNode key={stage.key} stage={stage} isLast={index === stages.length - 1} />
    ))}
  </div>
);

const buildJourney = (application, assessmentRow, aiInterview, technicalInterview) => {
  const stages = [];
  stages.push({
    key: "applied",
    label: "Applied",
    tone: "green",
    state: "completed",
    dateLabel: formatDate(application.applied_at),
    popover: (
      <div>
        <p className="text-sm text-gray-600">Application submitted</p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(application.applied_at) || "—"}</p>
      </div>
    )
  });

  let overallStatus = { label: "Assessment Pending", tone: "amber" };

  if (!assessmentRow) {
    stages.push({
      key: "assessment",
      label: "Assessment",
      tone: "gray",
      state: "upcoming",
      popover: <p className="text-sm text-gray-500">Not assigned yet</p>
    });
    overallStatus = { label: "Assessment Pending", tone: "amber" };
  } else if (assessmentRow.stage !== "completed") {
    const isPending = assessmentRow.stage === "pending";
    stages.push({
      key: "assessment",
      label: "Assessment",
      tone: isPending ? "blue" : "gray",
      state: isPending ? "current" : "upcoming",
      subLabel: isPending ? "In Progress" : "Scheduled",
      popover: (
        <div>
          <p className="text-sm text-gray-600">{isPending ? "Assessment available now" : "Assessment scheduled"}</p>
          {isPending && assessmentRow.item.scheduled_end && (
            <p className="text-xs text-gray-400 mt-1">
              Available until {formatDateTime(assessmentRow.item.scheduled_end)}
            </p>
          )}
          {!isPending && (
            <p className="text-xs text-gray-400 mt-1">Opens {formatDateTime(assessmentRow.item.scheduled_start)}</p>
          )}
        </div>
      )
    });
    overallStatus = isPending
      ? { label: "Assessment Pending", tone: "amber" }
      : { label: "Assessment Scheduled", tone: "amber" };
  } else {
    const item = assessmentRow.item;
    const pass = item.result === "Pass";
    const score = roundScore(item.percentage != null ? item.percentage : item.total_score);
    stages.push({
      key: "assessment",
      label: "Assessment",
      tone: pass ? "green" : "red",
      state: pass ? "completed" : "rejected",
      dateLabel: formatDate(item.submitted_at),
      popover: (
        <div>
          <p className="text-2xl font-bold text-[#3E3A74]">{score != null ? score : "—"}</p>
          <div className="mt-2">
            <StatusPill label={pass ? "PASS" : "FAIL"} tone={pass ? "green" : "red"} />
          </div>
        </div>
      )
    });

    if (!pass) {
      overallStatus = { label: "Application Closed - Not Selected", tone: "red" };
      stages.push({
        key: "ai_interview",
        label: "AI Interview",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      stages.push({
        key: "technical_interview",
        label: "Technical Interview",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      stages.push({
        key: "offer",
        label: "Offer Letter",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      return { stages, overallStatus };
    }

    if (!aiInterview || aiInterview.status === "Available") {
      stages.push({
        key: "ai_interview",
        label: "AI Interview",
        tone: "blue",
        state: "current",
        subLabel: "Not Started",
        popover: <p className="text-sm text-gray-500">Ready to begin</p>
      });
      overallStatus = { label: "AI Interview Pending", tone: "amber" };
      stages.push({
        key: "technical_interview",
        label: "Technical Interview",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      stages.push({
        key: "offer",
        label: "Offer Letter",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      return { stages, overallStatus };
    }

    if (aiInterview.status === "In Progress") {
      stages.push({
        key: "ai_interview",
        label: "AI Interview",
        tone: "blue",
        state: "current",
        subLabel: "In Progress",
        popover: <p className="text-sm text-gray-500">Interview in progress</p>
      });
      overallStatus = { label: "AI Interview In Progress", tone: "blue" };
      stages.push({
        key: "technical_interview",
        label: "Technical Interview",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      stages.push({
        key: "offer",
        label: "Offer Letter",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      return { stages, overallStatus };
    }

    const aiPass = aiInterview.result === "Pass";
    const aiScore = roundScore(aiInterview.overall_score);
    stages.push({
      key: "ai_interview",
      label: "AI Interview",
      tone: aiPass ? "green" : "red",
      state: aiPass ? "completed" : "rejected",
      dateLabel: formatDate(aiInterview.completed_at),
      popover: (
        <div>
          <p className="text-2xl font-bold text-[#3E3A74]">{aiScore != null ? `${aiScore}%` : "—"}</p>
          <div className="mt-2">
            <StatusPill label={aiPass ? "PASS" : "FAIL"} tone={aiPass ? "green" : "red"} />
          </div>
        </div>
      )
    });

    if (!aiPass || aiInterview.decision === "Rejected") {
      overallStatus = { label: "Application Closed - Not Selected", tone: "red" };
      stages.push({
        key: "technical_interview",
        label: "Technical Interview",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      stages.push({
        key: "offer",
        label: "Offer Letter",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      return { stages, overallStatus };
    }

    if (aiInterview.decision === "Selected") {
      stages.push({
        key: "technical_interview",
        label: "Technical Interview",
        tone: "gray",
        state: "skipped",
        subLabel: "Skipped",
        popover: <p className="text-sm text-gray-500">Not required for this offer</p>
      });
      stages.push({
        key: "offer",
        label: "Offer Letter",
        tone: "green",
        state: "completed",
        dateLabel: formatDate(aiInterview.completed_at),
        subLabel: "Offer Released",
        popover: (
          <div>
            <p className="text-sm text-gray-600">Offer Released</p>
            <p className="text-xs text-gray-400 mt-1">Check your email for the formal offer letter.</p>
          </div>
        )
      });
      overallStatus = { label: "Offer Released", tone: "green" };
      return { stages, overallStatus };
    }

    if (!technicalInterview) {
      stages.push({
        key: "technical_interview",
        label: "Technical Interview",
        tone: "blue",
        state: "current",
        subLabel: "Waiting for Recruiter Schedule",
        popover: <p className="text-sm text-gray-500">Your recruiter will schedule this shortly</p>
      });
      overallStatus = { label: "Waiting for Recruiter Schedule", tone: "amber" };
      stages.push({
        key: "offer",
        label: "Offer Letter",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      return { stages, overallStatus };
    }

    if (["Scheduled", "In Progress"].includes(technicalInterview.status)) {
      stages.push({
        key: "technical_interview",
        label: "Technical Interview",
        tone: "blue",
        state: "current",
        subLabel: technicalInterview.status,
        popover: (
          <div>
            <p className="text-sm text-gray-600">{formatDate(technicalInterview.scheduled_date)}</p>
            <p className="text-sm text-gray-600">{technicalInterview.scheduled_time}</p>
            {technicalInterview.recruiter_name && (
              <p className="text-xs text-gray-400 mt-1">Recruiter: {technicalInterview.recruiter_name}</p>
            )}
            <a
              href={`/technical-interview/room/${technicalInterview.room_code}`}
              className="inline-flex items-center justify-center mt-3 w-full rounded-lg bg-[#7393D3] hover:bg-[#5E84D6] text-white text-sm font-medium px-4 py-2 transition"
            >
              Join Interview
            </a>
          </div>
        )
      });
      overallStatus = { label: "Technical Interview Scheduled", tone: "blue" };
      stages.push({
        key: "offer",
        label: "Offer Letter",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      return { stages, overallStatus };
    }

    if (technicalInterview.status === "Awaiting Result") {
      stages.push({
        key: "technical_interview",
        label: "Technical Interview",
        tone: "purple",
        state: "current",
        subLabel: "Awaiting Result",
        popover: <p className="text-sm text-gray-500">Interview completed, result pending</p>
      });
      overallStatus = { label: "Technical Interview Completed - Awaiting Result", tone: "purple" };
      stages.push({
        key: "offer",
        label: "Offer Letter",
        tone: "gray",
        state: "upcoming",
        popover: <p className="text-sm text-gray-500">Not reached</p>
      });
      return { stages, overallStatus };
    }

    if (technicalInterview.result === "Selected") {
      stages.push({
        key: "technical_interview",
        label: "Technical Interview",
        tone: "green",
        state: "completed",
        dateLabel: formatDate(technicalInterview.scheduled_date),
        popover: (
          <div>
            <p className="text-sm text-gray-600">Interview completed</p>
            <StatusPill label="SELECTED" tone="green" />
          </div>
        )
      });
      stages.push({
        key: "offer",
        label: "Offer Letter",
        tone: "green",
        state: "completed",
        subLabel: "Offer Released",
        popover: (
          <div>
            <p className="text-sm text-gray-600">Offer Released</p>
            <p className="text-xs text-gray-400 mt-1">Check your email for the formal offer letter.</p>
          </div>
        )
      });
      overallStatus = { label: "Offer Released", tone: "green" };
      return { stages, overallStatus };
    }

    stages.push({
      key: "technical_interview",
      label: "Technical Interview",
      tone: "red",
      state: "rejected",
      dateLabel: formatDate(technicalInterview.scheduled_date),
      popover: (
        <div>
          <p className="text-sm text-gray-600">Interview completed</p>
          <StatusPill label="NOT SELECTED" tone="red" />
        </div>
      )
    });
    stages.push({
      key: "offer",
      label: "Offer Letter",
      tone: "gray",
      state: "upcoming",
      popover: <p className="text-sm text-gray-500">Not reached</p>
    });
    overallStatus = { label: "Application Closed - Not Selected", tone: "red" };
    return { stages, overallStatus };
  }

  stages.push({
    key: "ai_interview",
    label: "AI Interview",
    tone: "gray",
    state: "upcoming",
    popover: <p className="text-sm text-gray-500">Not reached</p>
  });
  stages.push({
    key: "technical_interview",
    label: "Technical Interview",
    tone: "gray",
    state: "upcoming",
    popover: <p className="text-sm text-gray-500">Not reached</p>
  });
  stages.push({
    key: "offer",
    label: "Offer Letter",
    tone: "gray",
    state: "upcoming",
    popover: <p className="text-sm text-gray-500">Not reached</p>
  });
  return { stages, overallStatus };
};

const JourneyCard = ({ candidateName, application, journey }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
    <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-gray-100">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Candidate</p>
        <h2 className="text-xl font-bold text-[#3E3A74] mt-1">{candidateName}</h2>
        <p className="text-gray-600 mt-3 font-medium">{application.job_title}</p>
        {application.company_name && <p className="text-sm text-gray-500 mt-0.5">{application.company_name}</p>}
        {formatDate(application.applied_at) && (
          <p className="text-xs text-gray-400 mt-2">Applied on {formatDate(application.applied_at)}</p>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Application Status</span>
        <StatusPill label={journey.overallStatus.label} tone={journey.overallStatus.tone} large />
      </div>
    </div>
    <Timeline stages={journey.stages} />
  </div>
);

export default function MyAssessments() {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [applicationsRes, pendingRes, upcomingRes, completedRes, aiRes, tiRes] = await Promise.all([
        getMyApplications(),
        getPendingAssessments(),
        getUpcomingAssessments(),
        getCompletedAssessments(),
        getMyAiInterviews().catch(() => ({ interviews: [] })),
        getMyTechnicalInterviews().catch(() => ({ interviews: [] }))
      ]);

      const assessmentByApplication = new Map();
      (upcomingRes.assessments || []).forEach((item) => {
        assessmentByApplication.set(item.application_id, { stage: "upcoming", item });
      });
      (pendingRes.assessments || []).forEach((item) => {
        assessmentByApplication.set(item.application_id, { stage: "pending", item });
      });
      (completedRes.assessments || []).forEach((item) => {
        const existing = assessmentByApplication.get(item.application_id);
        if (!existing || existing.stage !== "completed") {
          assessmentByApplication.set(item.application_id, { stage: "completed", item });
        }
      });

      const aiByApplication = new Map((aiRes.interviews || []).map((iv) => [iv.application_id, iv]));
      const tiByApplication = new Map((tiRes.interviews || []).map((ti) => [ti.application_id, ti]));

      const applications = applicationsRes.applications || [];
      const built = applications
        .filter((app) => assessmentByApplication.has(app.id))
        .map((app) => ({
          application: app,
          journey: buildJourney(
            app,
            assessmentByApplication.get(app.id),
            aiByApplication.get(app.id),
            tiByApplication.get(app.id)
          )
        }));

      setJourneys(built);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load your assessments right now");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const candidateName = user?.fullname || "Candidate";

  return (
    <UserDashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#3E3A74]">My Assessments</h1>
        <p className="mt-2 text-gray-500">
          Track your complete application journey, from assessment to offer, in one place.
        </p>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
      )}

      {loading && <p className="mt-8 text-gray-500">Loading your assessments...</p>}

      {!loading && journeys.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          You have no applications with assessments yet.
        </div>
      )}

      {!loading && journeys.length > 0 && (
        <div className="mt-8 space-y-8">
          {journeys.map(({ application, journey }) => (
            <JourneyCard
              key={application.id}
              candidateName={candidateName}
              application={application}
              journey={journey}
            />
          ))}
        </div>
      )}
    </UserDashboardLayout>
  );
}