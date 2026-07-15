import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getRecruiterDashboardSummary } from "../../services/recruiterService";
import { getAssessments } from "../../services/assessmentService";
import StatusBadge from "../../components/recruiter/StatusBadge";
const statCards = (stats) => [
  { title: "Active Jobs", value: stats.activeJobs, color: "text-[#3E3A74]" },
  { title: "Applications", value: stats.applications, color: "text-green-600" },
  { title: "Shortlisted", value: stats.shortlisted, color: "text-orange-500" },
  { title: "Interviews", value: stats.interviews, color: "text-blue-600" }
];
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalJobs: 0,
    applications: 0,
    shortlisted: 0,
    pending: 0,
    interviews: 0,
    unreadNotifications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [jobPerformance, setJobPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getRecruiterDashboardSummary();
        setStats(data.stats);
        setRecentApplications(data.recentApplications || []);
        setJobPerformance(data.jobPerformance || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load your dashboard right now");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  useEffect(() => {
    const loadAssessments = async () => {
      setAssessmentsLoading(true);
      try {
        const data = await getAssessments();
        setAssessments(data.assessments || []);
      } catch {
      } finally {
        setAssessmentsLoading(false);
      }
    };
    loadAssessments();
  }, []);
  const assessmentSummary = {
    total: assessments.length,
    published: assessments.filter((a) => a.status === "Published").length,
    draft: assessments.filter((a) => a.status === "Draft").length
  };
  return (
    <RecruiterDashboardLayout>
      <h1 className="text-4xl font-bold text-[#3E3A74]">Recruiter Dashboard</h1>
      <p className="mt-2 text-gray-500">Welcome back! Here's an overview of your recruitment activity.</p>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {stats.totalJobs === 0 && !loading && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 flex items-center justify-between">
          <span>You haven't posted any jobs yet. Post your first job to start receiving applications.</span>
          <button onClick={() => navigate("/recruiter/post-job")} className="font-semibold underline">
            Post a Job
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        {statCards(stats).map((card) => (
          <div key={card.title} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition">
            <p className="text-gray-500">{card.title}</p>
            <h2 className={`text-4xl font-bold mt-3 ${card.color}`}>{loading ? "..." : card.value}</h2>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#3E3A74]">Applications by Job</h2>
          {!loading && jobPerformance.length === 0 && (
            <p className="mt-5 text-gray-500">No job postings yet.</p>
          )}
          <div className="mt-5 space-y-4">
            {jobPerformance.slice(0, 6).map((job) => (
              <div key={job.id} className="flex justify-between">
                <span className="text-gray-900">{job.title}</span>
                <span className="font-semibold text-gray-900">{job.applicationsCount} Applicants</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#3E3A74]">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 mt-5">
            <button onClick={() => navigate("/recruiter/post-job")} className="rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 font-semibold transition">
              Post Job
            </button>
            <button onClick={() => navigate("/recruiter/interviews")} className="rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 font-semibold transition">
              Interviews
            </button>
            <button onClick={() => navigate("/recruiter/applicants")} className="rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 font-semibold transition">
              Applicants
            </button>
            <button onClick={() => navigate("/recruiter/assessments")} className="rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 font-semibold transition">
              Assessments
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#3E3A74]">Assessments</h2>
          <button onClick={() => navigate("/recruiter/assessments")} className="text-[#7393D3] font-semibold">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="bg-gray-50 rounded-xl py-4 text-center">
            <p className="text-2xl font-bold text-[#3E3A74]">{assessmentsLoading ? "..." : assessmentSummary.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-gray-50 rounded-xl py-4 text-center">
            <p className="text-2xl font-bold text-green-600">{assessmentsLoading ? "..." : assessmentSummary.published}</p>
            <p className="text-sm text-gray-500">Published</p>
          </div>
          <div className="bg-gray-50 rounded-xl py-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{assessmentsLoading ? "..." : assessmentSummary.draft}</p>
            <p className="text-sm text-gray-500">Draft</p>
          </div>
        </div>
        {!assessmentsLoading && assessments.length === 0 && (
          <p className="mt-5 text-gray-500">
            No assessments yet.{" "}
            <button onClick={() => navigate("/recruiter/assessments/create")} className="text-[#7393D3] font-semibold underline">
              Create your first assessment
            </button>
          </p>
        )}
        {!assessmentsLoading && assessments.length > 0 && (
          <div className="mt-5 divide-y divide-gray-100">
            {assessments.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <button
                  onClick={() => navigate(`/recruiter/assessments/${a.id}`)}
                  className="font-semibold text-gray-900 hover:text-[#7393D3] text-left"
                >
                  {a.title}
                </button>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#3E3A74]">Recent Applications</h2>
          <button onClick={() => navigate("/recruiter/applicants")} className="text-[#7393D3] font-semibold">
            View All →
          </button>
        </div>
        {!loading && recentApplications.length === 0 && (
          <p className="mt-5 text-gray-500">No applications received yet.</p>
        )}
        <div className="mt-5 divide-y divide-gray-100">
          {recentApplications.map((app) => (
            <div key={app.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-semibold text-gray-900">{app.candidate_name}</p>
                <p className="text-sm text-gray-500">{app.job_title}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </RecruiterDashboardLayout>
  );
}
