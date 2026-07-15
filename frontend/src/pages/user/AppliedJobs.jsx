import { useState, useEffect } from "react";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import { getMyApplications, withdrawApplication } from "../../services/applicationService";
const statusColor = (status) => {
  switch (status) {
    case "Shortlisted":
    case "Interview Scheduled":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-600";
    case "Withdrawn":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const recruiterMessageFor = (item) => {
  switch (item.status) {
    case "Shortlisted":
      return item.ats_score != null
        ? `Auto-shortlisted by ATS (score: ${item.ats_score}%)`
        : "Your profile has been shortlisted";
    case "Rejected":
      return item.ats_score != null
        ? `ATS score was ${item.ats_score}% - below the required threshold`
        : "Profile does not match current requirements";
    case "Interview Scheduled":
      return "An interview has been scheduled for you";
    case "Withdrawn":
      return "You withdrew this application";
    default:
      return "Resume is under review";
  }
};
const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [withdrawingJobId, setWithdrawingJobId] = useState(null);
  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyApplications();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load applications right now");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadApplications();
  }, []);
  const handleWithdraw = async (jobId) => {
    setActionError("");
    setWithdrawingJobId(jobId);
    try {
      await withdrawApplication(jobId);
      setApplications((prev) =>
        prev.map((item) => (item.job_id === jobId ? { ...item, status: "Withdrawn" } : item))
      );
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to withdraw this application right now");
    } finally {
      setWithdrawingJobId(null);
    }
  };
  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-heading">
            Applied Jobs
          </h1>
          <p className="mt-2 text-body">
            Track all your SHNOOR job applications.
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
            {actionError}
          </div>
        )}
        {loading && (
          <p className="text-body">Loading applications...</p>
        )}
        {!loading && applications.length === 0 && !error && (
          <div className="bg-white border border-border rounded-xl p-8 text-center text-body shadow-sm">
            You have not applied to any jobs yet.
          </div>
        )}
        {!loading && applications.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left">
                    Job Title
                  </th>
                  <th className="px-6 py-4 text-left">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left">
                    Applied Date
                  </th>
                  <th className="px-6 py-4 text-left">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left">
                    ATS Score
                  </th>
                  <th className="px-6 py-4 text-left">
                    Recruiter Message
                  </th>
                  <th className="px-6 py-4 text-left">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-border hover:bg-gray-50"
                  >
                    <td className="px-6 py-5 font-medium">
                      {item.job_title}
                    </td>
                    <td className="px-6 py-5">
                      {item.company_name || "SHNOOR Technologies"}
                    </td>
                    <td className="px-6 py-5">
                      {formatDate(item.applied_at)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {item.ats_score != null ? (
                        <span
                          className={`font-semibold ${
                            item.ats_score >= 80 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {item.ats_score}%
                        </span>
                      ) : (
                        <span className="text-body text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-body">
                      {item.recruiter_note || recruiterMessageFor(item)}
                    </td>
                    <td className="px-6 py-5">
                      {item.status !== "Withdrawn" && item.status !== "Rejected" ? (
                        <button
                          type="button"
                          onClick={() => handleWithdraw(item.job_id)}
                          disabled={withdrawingJobId === item.job_id}
                          className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                        >
                          {withdrawingJobId === item.job_id ? "Withdrawing..." : "Withdraw"}
                        </button>
                      ) : (
                        <span className="text-body text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};
export default AppliedJobs;