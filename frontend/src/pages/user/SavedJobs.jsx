import { useState, useEffect } from "react";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import JobDetailsModal from "../../components/user/JobDetailsModal";
import { getSavedJobs, removeSavedJob } from "../../services/savedJobService";
import { applyToJob } from "../../services/applicationService";
const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [removingJobId, setRemovingJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const loadSavedJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSavedJobs();
      setSavedJobs(data.jobs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load saved jobs right now");
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSavedJobs();
  }, []);
  const handleRemove = async (jobId) => {
    setActionError("");
    setRemovingJobId(jobId);
    try {
      await removeSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
      setSelectedJob((prev) => (prev && prev.id === jobId ? null : prev));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to remove this job right now");
    } finally {
      setRemovingJobId(null);
    }
  };
  const isApplied = (job) => Boolean(job.application_status && job.application_status !== "Withdrawn");
  const handleApply = async (job) => {
    if (isApplied(job)) return;
    setActionError("");
    setApplyingJobId(job.id);
    try {
      const data = await applyToJob(job.id);
      setSavedJobs((prev) =>
        prev.map((item) => (item.id === job.id ? { ...item, application_status: data.application.status } : item))
      );
      setSelectedJob((prev) =>
        prev && prev.id === job.id ? { ...prev, application_status: data.application.status } : prev
      );
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to submit application right now");
    } finally {
      setApplyingJobId(null);
    }
  };
  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-heading">
            Saved Jobs
          </h1>
          <p className="mt-2 text-body">
            Jobs you have bookmarked for future applications.
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
          <p className="text-body">Loading saved jobs...</p>
        )}
        {!loading && savedJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-heading">
              No Saved Jobs
            </h2>
            <p className="mt-2 text-body">
              Save jobs from the Search Jobs page to view them here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-heading">
                      {job.title}
                    </h2>
                    <p className="mt-2 text-body">
                      {job.company_name || "SHNOOR Technologies"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(job.id)}
                    disabled={removingJobId === job.id}
                    className="border border-red-500 text-red-500 px-5 py-2 rounded-lg hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                  >
                    {removingJobId === job.id ? "Removing..." : "Remove"}
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <p className="text-sm text-body">Location</p>
                    <h4 className="font-semibold">{job.location}</h4>
                  </div>
                  <div>
                    <p className="text-sm text-body">Experience</p>
                    <h4 className="font-semibold">{job.experience}</h4>
                  </div>
                  <div>
                    <p className="text-sm text-body">Salary</p>
                    <h4 className="font-semibold">{job.salary}</h4>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleApply(job)}
                    disabled={applyingJobId === job.id || isApplied(job)}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isApplied(job) ? `Applied \u00b7 ${job.application_status}` : applyingJobId === job.id ? "Applying..." : "Apply Now"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="border border-border px-6 py-3 rounded-lg hover:bg-gray-100"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => handleApply(selectedJob)}
          onSave={null}
          applying={applyingJobId === selectedJob.id}
          isSaved
          applicationStatus={selectedJob.application_status}
        />
      )}
    </UserDashboardLayout>
  );
};
export default SavedJobs;