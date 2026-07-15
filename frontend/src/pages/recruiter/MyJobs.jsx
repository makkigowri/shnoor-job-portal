import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getMyJobs, deleteJob } from "../../services/jobService";
export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load your jobs right now");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadJobs();
  }, []);
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete job");
    }
  };
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">My Jobs</h1>
          <p className="mt-2 text-gray-500">Manage all jobs posted by SHNOOR Technologies.</p>
        </div>
        <Link to="/recruiter/post-job" className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-6 py-3 rounded-xl transition">+ New Job</Link>
      </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {loading && <p className="mt-8 text-gray-500">Loading your jobs...</p>}
      {!loading && jobs.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
          You haven't posted any jobs yet.
        </div>
      )}
      {!loading && jobs.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-4">Job</th>
                <th className="text-left px-6 py-4">Department</th>
                <th className="text-left px-6 py-4">Location</th>
                <th className="text-left px-6 py-4">Applications</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-5 font-semibold text-gray-900">{job.title}</td>
                  <td className="px-6 py-5 text-gray-900">{job.department}</td>
                  <td className="px-6 py-5 text-gray-900">{job.location}</td>
                  <td className="px-6 py-5 font-semibold text-gray-900">{job.applications_count ?? 0}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                    
                      <button onClick={() => navigate(`/recruiter/edit-job/${job.id}`)} className="px-4 py-2 rounded-lg border border-[#7393D3] text-[#3E3A74] hover:bg-[#7393D3] hover:text-white transition">Edit</button>
                      <button onClick={() => handleDelete(job.id)} className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RecruiterDashboardLayout>
  );
}
