import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { createJob } from "../../services/jobService";
const initialState = {title: "", department: "", employmentType: "Full Time",experience: "",salary: "",location: "",skills: "",openings: 1,description: "",responsibilities: "",requirements: ""};
export default function PostJob() {
  const [job, setJob] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createJob(job);
      alert("Job Posted Successfully!");
      setJob(initialState);
      navigate("/recruiter/my-jobs");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <RecruiterDashboardLayout>
      <h1 className="text-4xl font-bold text-[#3E3A74]">Post New Job</h1>
      <p className="mt-2 text-gray-500">Create a professional job opening for SHNOOR Technologies.</p>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white mt-8 rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="font-medium text-gray-900">Job Title</label>
            <input name="title" id="title" value={job.title} onChange={handleChange} required className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="Frontend Developer" />
          </div>
          <div>
            <label htmlFor="department" className="font-medium text-gray-900">Department</label>
            <input id="department" name="department" value={job.department} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="Software Development" />
          </div>
          <div>
            <label htmlFor="employmentType" className="font-medium text-gray-900">Employment Type</label>
            <select name="employmentType" id="employementTyoe" value={job.employmentType} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none">
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Internship</option>
              <option>Remote</option>
              <option>Contract</option>
            </select>
          </div>
          <div>
            <label htmlFor="experience" className="font-medium text-gray-900">Experience</label>
            <input name="experience" id="experience" value={job.experience} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="2-4 Years" />
          </div>
          <div>
            <label htmlFor="salary" className="font-medium text-gray-900">Salary</label>
            <input name="salary" id="salary" value={job.salary} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="6 LPA - 10 LPA" />
          </div>
          <div>
            <label htmlFor="location" className="font-medium text-gray-900">Location</label>
            <input name="location" id="location" value={job.location} onChange={handleChange} required className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="Hyderabad" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="skills" className="font-medium text-gray-900">Skills</label>
            <input name="skills" id="skills" value={job.skills} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" placeholder="React, JavaScript, HTML, CSS" />
          </div>
          <div>
            <label htmlFor="number" className="font-medium text-gray-900">Number of Openings</label>
            <input type="number" id="number" min="1" name="openings" value={job.openings} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="description" className="font-medium text-gray-900">Job Description</label>
          <textarea rows="6" name="description" id="description" value={job.description} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
        </div>
        <div className="mt-6">
          <label htmlFor="responsibilites" className="font-medium text-gray-900">Responsibilities</label>
          <textarea rows="5" name="responsibilities" id="responsibilites" value={job.responsibilities} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
        </div>
        <div className="mt-6">
          <label htmlFor="requirements" className="font-medium text-gray-900">Requirements</label>
          <textarea rows="5" name="requirements" id="requirements" value={job.requirements} onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none" />
        </div>
        <button disabled={submitting} className="mt-8 bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60">
          {submitting ? "Publishing..." : "Publish Job"}
        </button>
      </form>
    </RecruiterDashboardLayout>
  );
}
