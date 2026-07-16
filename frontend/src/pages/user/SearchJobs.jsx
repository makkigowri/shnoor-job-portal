import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import JobDetailsModal from "../../components/user/JobDetailsModal";
import { searchJobs } from "../../services/jobService";
import { saveJob, removeSavedJob } from "../../services/savedJobService";
import { applyToJob } from "../../services/applicationService";
const SearchJobs = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("title") || "");
  const [location, setLocation] = useState("Location");
  const [experience, setExperience] = useState("Experience");
  const [employmentType, setEmploymentType] = useState("Job Type");
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingJobId, setSavingJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const limit = 5;
  const fetchJobs = useCallback(
    async (pageToFetch = 1) => {
      setLoading(true);
      setError("");
      try {
        const data = await searchJobs({
          title: search || undefined,
          location: location !== "Location" ? location : undefined,
          experience: experience !== "Experience" ? experience : undefined,
          employmentType: employmentType !== "Job Type" ? employmentType : undefined,
          page: pageToFetch,
          limit
        });
        setJobs(data.jobs || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setPage(data.page || pageToFetch);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load jobs right now");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    },
    [search, location, experience, employmentType]
  );
  useEffect(() => {
    fetchJobs(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };
  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    fetchJobs(nextPage);
  };
  const updateJobInList = (jobId, changes) => {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, ...changes } : job)));
    setSelectedJob((prev) => (prev && prev.id === jobId ? { ...prev, ...changes } : prev));
  };
  const handleToggleSave = async (job) => {
    setActionError("");
    setSavingJobId(job.id);
    try {
      if (job.is_saved) {
        await removeSavedJob(job.id);
        updateJobInList(job.id, { is_saved: false });
      } else {
        await saveJob(job.id);
        updateJobInList(job.id, { is_saved: true });
      }
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
      updateJobInList(job.id, { application_status: data.application.status });
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to submit application right now");
    } finally {
      setApplyingJobId(null);
    }
  };
  const isApplied = (job) => Boolean(job.application_status && job.application_status !== "Withdrawn");
  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-heading">
            Search Jobs
          </h1>
          <p className="text-body mt-2">
            Explore the latest SHNOOR job opportunities.
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <div className="grid md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Job Title"
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="border border-border rounded-lg px-4 py-3"
            />
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="border border-border rounded-lg px-4 py-3">
              <option>Location</option>
              <option>Hyderabad</option>
              <option>Bangalore</option>
              <option>Remote</option>
            </select>
            <select value={experience} onChange={(e) => setExperience(e.target.value)} className="border border-border rounded-lg px-4 py-3">
              <option>Experience</option>
              <option>0-2 Years</option>
              <option>2-4 Years</option>
              <option>5+ Years</option>
            </select>
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="border border-border rounded-lg px-4 py-3">
              <option>Job Type</option>
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Internship</option>
              <option>Remote</option>
              <option>Contract</option>
            </select>
            <button type="submit" className="bg-primary text-white rounded-lg hover:bg-primary-hover">
              Search
            </button>
          </div>
        </form>
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
          <p className="text-body">Loading jobs...</p>
        )}
        {!loading && jobs.length === 0 && !error && (
          <div className="bg-white border border-border rounded-xl p-8 text-center text-body shadow-sm">
            No jobs found matching your search.
          </div>
        )}

        <div className="space-y-5">

          {jobs.map((job) => (

            <div
              key={job.id}
              className="bg-white border border-border rounded-xl p-6 shadow-sm hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-heading">
                    {job.title}
                  </h2>
                  <p className="text-body mt-2">
                    {job.company_name || "SHNOOR Technologies"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSave(job)}
                  disabled={savingJobId === job.id}
                  className="border border-primary px-5 py-2 rounded-lg text-primary hover:bg-primary hover:text-white disabled:opacity-50"
                >
                  {savingJobId === job.id ? "..." : job.is_saved ? "Saved" : "Save"}
                </button>
              </div>
              <div className="grid md:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-sm text-body">
                    Location
                  </p>
                  <h4 className="font-semibold">
                    {job.location}
                  </h4>
                </div>
                <div>
                  <p className="text-sm text-body">
                    Experience
                  </p>

                  <h4 className="font-semibold">
                    {job.experience}
                  </h4>

                </div>

                <div>

                  <p className="text-sm text-body">
                    Salary
                  </p>

                  <h4 className="font-semibold">
                    {job.salary}
                  </h4>

                </div>

                <div>

                  <p className="text-sm text-body">
                    Employment
                  </p>

                  <h4 className="font-semibold">
                    {job.employment_type}
                  </h4>

                </div>

              </div>

              <div className="mt-6 flex gap-4">

                <button
                  type="button"
                  onClick={() => handleApply(job)}
                  disabled={applyingJobId === job.id || isApplied(job)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border border-border rounded-xl px-6 py-4 shadow-sm">
            <p className="text-sm text-body">
              Showing page {page} of {totalPages} ({total} jobs found)
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="border border-border px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="border border-border px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => handleApply(selectedJob)}
          onSave={() => handleToggleSave(selectedJob)}
          applying={applyingJobId === selectedJob.id}
          isSaved={selectedJob.is_saved}
          applicationStatus={selectedJob.application_status}
        />
      )}
    </UserDashboardLayout>
  );
};
export default SearchJobs;