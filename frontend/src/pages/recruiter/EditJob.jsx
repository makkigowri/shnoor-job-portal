import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getJobById, updateJob } from "../../services/jobService";
const emptyState = {
  title: "",
  department: "",
  employmentType: "Full Time",
  experience: "",
  salary: "",
  location: "",
  skills: "",
  openings: 1,
  description: "",
  responsibilities: "",
  requirements: "",
  status: "Active"
};
export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getJobById(id);
        const j = data.job;
        setJob({
          title: j.title || "",
          department: j.department || "",
          employmentType: j.employment_type || "Full Time",
          experience: j.experience || "",
          salary: j.salary || "",
          location: j.location || "",
          skills: j.skills || "",
          openings: j.openings || 1,
          description: j.description || "",
          responsibilities: j.responsibilities || "",
          requirements: j.requirements || "",
          status: j.status || "Active"
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load this job");
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await updateJob(id, job);
      alert("Job Updated Successfully!");
      navigate("/recruiter/my-jobs");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <RecruiterDashboardLayout>
        <p className="text-gray-500">Loading job details...</p>
      </RecruiterDashboardLayout>
    );
  }
  return (
    <RecruiterDashboardLayout>
      <h1 className="text-4xl font-bold text-[#3E3A74]">Edit Job</h1>
      <p className="mt-2 text-gray-500">Update this job opening for SHNOOR Technologies.</p>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white mt-8 rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-medium text-gray-900">Job Title</label>
            <input name="title" value={job.title} onChange={handleChange} required className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="Frontend Developer" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Department</label>
            <input name="department" value={job.department} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="Software Development" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Employment Type</label>
            <select name="employmentType" value={job.employmentType} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none">
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Internship</option>
              <option>Remote</option>
              <option>Contract</option>
            </select>
          </div>
          <div>
            <label className="font-medium text-gray-900">Experience</label>
            <input name="experience" value={job.experience} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="2-4 Years" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Salary</label>
            <input name="salary" value={job.salary} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="6 LPA - 10 LPA" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Location</label>
            <input name="location" value={job.location} onChange={handleChange} required className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="Hyderabad" />
          </div>
          <div className="md:col-span-2">
            <label className="font-medium text-gray-900">Skills</label>
            <input name="skills" value={job.skills} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="React, JavaScript, HTML, CSS" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Number of Openings</label>
            <input type="number" min="1" name="openings" value={job.openings} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
          <div>
            <label className="font-medium text-gray-900">Status</label>
            <select name="status" value={job.status} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none">
              <option>Active</option>
              <option>Closed</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <label className="font-medium text-gray-900">Job Description</label>
          <textarea rows="6" name="description" value={job.description} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
        </div>
        <div className="mt-6">
          <label className="font-medium text-gray-900">Responsibilities</label>
          <textarea rows="5" name="responsibilities" value={job.responsibilities} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
        </div>
        <div className="mt-6">
          <label className="font-medium text-gray-900">Requirements</label>
          <textarea rows="5" name="requirements" value={job.requirements} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
        </div>
        <div className="mt-8 flex gap-4">
          <button disabled={submitting} className="bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60">
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate("/recruiter/my-jobs")} className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-100 transition">
            Cancel
          </button>
        </div>
      </form>
    </RecruiterDashboardLayout>
  );
}
