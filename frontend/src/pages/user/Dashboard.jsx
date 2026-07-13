import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import { getDashboardSummary } from "../../services/dashboardService";
import { saveJob, removeSavedJob } from "../../services/savedJobService";
import { applyToJob } from "../../services/applicationService";
import useAuth from "../../hooks/useAuth";
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
    setApplyingJobId(job.id);
    try {
      const data = await applyToJob(job.id);
      setRecommendedJobs((prev) =>
        prev.map((item) =>
          item.id === job.id ? { ...item, application_status: data.application.status } : item
        )
      );
      setStats((prev) => ({ ...prev, jobsApplied: prev.jobsApplied + 1 }));
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
            onClick={() => navigate("/user/resume")}
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
      <div className="grid lg:grid-cols-3 gap-8 mt-10">
        <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-[#3E3A74] mb-6">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/user/profile")}
              className="w-full rounded-xl bg-[#7393D3] text-white py-3 font-semibold hover:bg-[#5E84D6] transition"
            >
              Complete Profile
            </button>
            <button
              onClick={() => navigate("/user/jobs")}
              className="w-full rounded-xl border border-[#7393D3] py-3 font-semibold text-[#3E3A74] hover:bg-[#EEF2FF] transition"
            >
              Search Jobs
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-md border border-gray-200">
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
          <div className="grid sm:grid-cols-2 gap-6">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition flex flex-col"
              >
                <h3 className="text-xl font-bold text-[#3E3A74]">
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
                      ? `Applied · ${job.application_status}`
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
      </div>
    </UserDashboardLayout>
  );
};
export default Dashboard;