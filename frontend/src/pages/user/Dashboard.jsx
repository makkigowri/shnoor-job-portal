import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, CheckCircle2 } from "lucide-react";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import { getDashboardSummary } from "../../services/dashboardService";
import { saveJob, removeSavedJob } from "../../services/savedJobService";
import { applyToJob } from "../../services/applicationService";
import { getMyResumes } from "../../services/resumeService";
import useAuth from "../../hooks/useAuth";
import ResumeViewerModal from "../../components/common/ResumeViewerModal";
const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5001/api"
).replace(/\/api\/?$/, "");
const MATCH_BADGES = {
  highly_matched: { label: "Highly Matched", Icon: Star },
  recommended: { label: "Recommended", Icon: CheckCircle2 }
};
const MatchBadge = ({ matchType }) => {
  const badge = MATCH_BADGES[matchType];
  if (!badge) return null;
  const { label, Icon } = badge;
  return (
    <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full border border-[#166534]/20 bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#166534]">
      <Icon size={12} strokeWidth={2.5} />
      {label}
    </span>
  );
};
const statCards = (stats) => [
  {
    title: "Profile Completion",
    value: `${stats.profileCompletion}%`,
    color: "text-[#3E3A74]"
  },
  {
    title: "Jobs Applied",
    value: String(stats.jobsApplied).padStart(2, "0"),
    color: "text-[#3E3A74]"
  },
  {
    title: "Saved Jobs",
    value: String(stats.savedJobs).padStart(2, "0"),
    color: "text-[#3E3A74]"
  },
  {
    title: "Notifications",
    value: String(stats.unreadNotifications).padStart(2, "0"),
    color: "text-[#3E3A74]"
  }
];
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    profileCompletion: 0,
    jobsApplied: 0,
    savedJobs: 0,
    shortlisted: 0,
    unreadNotifications: 0
  });
  const [hasResume, setHasResume] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingJobId, setSavingJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeList, setResumeList] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [pendingJob, setPendingJob] = useState(null);
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [resumeViewerUrl, setResumeViewerUrl] = useState("");
  const [selectedViewerResume, setSelectedViewerResume] = useState(null);
  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboardSummary();
      setStats(data.stats);
      setHasResume(data.hasResume);
      setRecommendedJobs(data.recommendedJobs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load your dashboard right now");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDashboard();
  }, []);
  const handleToggleSave = async (job) => {
    setActionError("");
    setSavingJobId(job.id);
    try {
      if (job.is_saved) {
        await removeSavedJob(job.id);
      } else {
        await saveJob(job.id);
      }
      setRecommendedJobs((prev) =>
        prev.map((item) => (item.id === job.id ? { ...item, is_saved: !job.is_saved } : item))
      );
      setStats((prev) => ({ ...prev, savedJobs: prev.savedJobs + (job.is_saved ? -1 : 1) }));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to update saved jobs right now");
    } finally {
      setSavingJobId(null);
    }
  };
  const handleApply = async (job) => {
    if (job.application_status && job.application_status !== "Withdrawn") return;

    setActionError("");
    try {
      const data = await getMyResumes();
      setResumeList(data.resumes || []);
      setSelectedResume("");
      setPendingJob(job);
      setShowResumePopup(true);
    } catch (err) {
      setActionError("Unable to load resumes.");
    }
  };
  const handleConfirmApply = async () => {
    if (!pendingJob) return;
    if (!selectedResume) {
      setActionError("Please select a resume.");
      return;
    }
    setActionError("");
    setApplyingJobId(pendingJob.id);
    try {
      const data = await applyToJob(pendingJob.id, selectedResume);
      setRecommendedJobs((prev) =>
        prev.map((item) =>
          item.id === pendingJob.id ? { ...item, application_status: data.application.status } : item
        )
      );
      setStats((prev) => ({ ...prev, jobsApplied: prev.jobsApplied + 1 }));
      setShowResumePopup(false);
      setPendingJob(null);
      setSelectedResume("");
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to submit application right now");
    } finally {
      setApplyingJobId(null);
    }
  };
  const isApplied = (job) => Boolean(job.application_status && job.application_status !== "Withdrawn");
  return (
    <UserDashboardLayout>
      <div className="rounded-3xl bg-gradient-to-r from-[#3E3A74] to-[#7393D3] p-10 text-white shadow-xl">
        <h1 className="text-4xl font-bold">
          Welcome Back{user?.fullname ? `, ${user.fullname.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-3 text-lg text-white/90">
          Track your applications, discover new opportunities and build your career with SHNOOR.
        </p>
      </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {actionError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
          {actionError}
        </div>
      )}
      {!hasResume && !loading && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 flex items-center justify-between">
          <span>Upload your resume so you can start applying to jobs.</span>
          <button
            onClick={() => navigate("/user/profile")}
            className="font-semibold underline"
          >
            Upload Now
          </button>
        </div>
      )}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
        {statCards(stats).map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-3xl p-7 shadow-md border border-gray-200 hover:shadow-xl transition"
          >
            <p className="text-gray-500">
              {item.title}
            </p>
            <h2 className={`text-4xl font-bold mt-3 ${item.color}`}>
              {loading ? "..." : item.value}
            </h2>
          </div>
        ))}
      </div>
      <div className="mt-10 bg-white rounded-3xl p-8 shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#3E3A74]">
            Recommended Jobs
          </h2>
          <button
            onClick={() => navigate("/user/jobs")}
            className="text-[#7393D3] font-semibold"
          >
            View All →
          </button>
        </div>
        {loading && (
          <p className="text-gray-500">Loading recommendations...</p>
        )}
        {!loading && recommendedJobs.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No new recommendations right now. Check back soon or explore all jobs.
          </div>
        )}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {recommendedJobs.map((job) => (
            <div
              key={job.id}
              className="relative border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition flex flex-col"
            >
              <MatchBadge matchType={job.matchType} />
              <h3 className="text-xl font-bold text-[#3E3A74] pr-28">
                {job.title}
              </h3>
              <p className="text-gray-600 mt-2">
                {job.company_name || "SHNOOR Technologies"}
              </p>
              <div className="mt-5 space-y-2 text-gray-700">
                <p>{job.location}</p>
                <p>{job.salary}</p>
              </div>
              <div className="mt-auto pt-6 flex gap-3">
                <button
                  onClick={() => handleApply(job)}
                  disabled={applyingJobId === job.id || isApplied(job)}
                  className="flex-1 rounded-xl bg-[#7393D3] py-3 text-white font-semibold hover:bg-[#5E84D6] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                {isApplied(job)
  ? job.application_status === "Applied"
    ? "Applied"
    : `Applied - ${job.application_status}`
  : applyingJobId === job.id
  ? "Applying..."
  : "Apply Now"}
                </button>
                <button
                  onClick={() => handleToggleSave(job)}
                  disabled={savingJobId === job.id}
                  className="rounded-xl border border-[#7393D3] px-4 py-3 font-semibold text-[#3E3A74] hover:bg-[#EEF2FF] transition disabled:opacity-50"
                >
                  {savingJobId === job.id ? "..." : job.is_saved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showResumePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="border-b px-6 py-5">
              <h2 className="text-2xl font-bold text-heading">Select Resume</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose the resume you want to submit with this application.
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">My Resumes</h3>
                <span className="text-sm text-gray-500">
                  {resumeList.length} Resume{resumeList.length > 1 ? "s" : ""}
                </span>
              </div>
              {resumeList.length === 0 ? (
                <div className="border rounded-xl p-8 text-center text-gray-500">
                  No resumes uploaded.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {resumeList.map((resume) => (
                    <label
                      key={resume.id}
                      className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                        selectedResume === resume.id
                          ? "border-primary bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-primary hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="resume"
                          checked={selectedResume === resume.id}
                          onChange={() => setSelectedResume(resume.id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {resume.resume_filename || resume.resume_name}
                          </h4>
                          <p className="text-sm text-gray-500">Resume PDF</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeViewerUrl(`${API_ORIGIN}${resume.resume_path}`);
                          setSelectedViewerResume(resume);
                          setShowResumeViewer(true);
                        }}
                        className="text-primary font-medium hover:underline"
                      >
                        View
                      </button>
                    </label>
                  ))}
                </div>
              )}
              {showResumeViewer && (
                <ResumeViewerModal
                  url={resumeViewerUrl}
                  filename={
                    selectedViewerResume?.resume_filename ||
                    selectedViewerResume?.resume_name ||
                    "resume.pdf"
                  }
                  onClose={() => {
                    setShowResumeViewer(false);
                    setResumeViewerUrl("");
                    setSelectedViewerResume(null);
                  }}
                />
              )}
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4 bg-gray-50">
              <button
                onClick={() => {
                  setShowResumePopup(false);
                  setPendingJob(null);
                  setSelectedResume("");
                }}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={!selectedResume || applyingJobId === pendingJob?.id}
                className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {applyingJobId === pendingJob?.id ? "Submitting..." : "Apply Resume"}
              </button>
            </div>
          </div>
        </div>
      )}
    </UserDashboardLayout>
  );
};
export default Dashboard;