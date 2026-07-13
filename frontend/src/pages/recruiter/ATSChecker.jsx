import { useEffect, useState } from "react";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getMyJobs } from "../../services/jobService";
import { analyzeResume } from "../../services/atsService";
const toneStyle = (tone) => {
  switch (tone) {
    case "success":
      return { bar: "bg-green-500", badge: "bg-green-100 text-green-700" };
    case "warning":
      return { bar: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700" };
    case "error":
      return { bar: "bg-red-500", badge: "bg-red-100 text-red-600" };
    default:
      return { bar: "bg-blue-500", badge: "bg-blue-100 text-blue-700" };
  }
};
export default function ATSChecker() {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [resume, setResume] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getMyJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch(() => {});
  }, []);
  const handleResume = (e) => {
    if (e.target.files.length > 0) {
      setResume(e.target.files[0]);
      setResult(null);
      setError("");
    }
  };
  const handleAnalyze = async () => {
    if (!jobId) {
      setError("Please select which job to check this resume against");
      return;
    }
    if (!resume) {
      setError("Please upload a resume first");
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      const data = await analyzeResume(jobId, resume);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to analyze this resume right now");
    } finally {
      setAnalyzing(false);
    }
  };
  const tone = result ? toneStyle(result.recommendation?.tone) : toneStyle("info");
  return (
    <RecruiterDashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#3E3A74]">ATS Resume Checker</h1>
        <p className="mt-2 text-gray-500">Upload a candidate resume and compare it against one of your job postings' required skills.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <label className="font-medium text-gray-900">Check Against Job</label>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full mt-2 mb-6 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
          >
            <option value="">Select a job posting...</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <label htmlFor="resume" className="border-2 border-dashed border-[#7393D3] rounded-2xl h-64 flex flex-col justify-center items-center cursor-pointer hover:bg-gray-50 transition">
            <h2 className="text-2xl font-semibold text-[#3E3A74]">Upload Resume</h2>
            <p className="mt-2 text-gray-500">PDF or DOCX</p>
          </label>
          <input id="resume" type="file" accept=".pdf,.docx" className="hidden" onChange={handleResume} />
          {resume && (
            <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-5">
              <h3 className="font-semibold text-[#3E3A74]">Resume Selected</h3>
              <p className="mt-2 text-gray-900">{resume.name}</p>
            </div>
          )}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>
          )}
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="mt-8 bg-[#7393D3] hover:bg-[#5E84D6] text-white px-8 py-3 rounded-xl transition disabled:opacity-60"
          >
            {analyzing ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#3E3A74]">ATS Score</h2>
            {result && result.score !== null ? (
              <div className="mt-5">
                <div className="w-full h-4 rounded-full bg-gray-200">
                  <div className={`h-4 rounded-full ${tone.bar}`} style={{ width: `${result.score}%` }} />
                </div>
                <p className="mt-3 font-bold text-2xl text-gray-900">{result.score}%</p>
              </div>
            ) : (
              <p className="mt-5 text-gray-500">Upload a resume and select a job to see the score.</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#3E3A74]">Matching Skills</h2>
            {result && result.matchedSkills?.length > 0 ? (
              <ul className="mt-4 space-y-2 list-disc pl-5 text-gray-900">
                {result.matchedSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-gray-500">No matches yet.</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#3E3A74]">Missing Skills</h2>
            {result && result.missingSkills?.length > 0 ? (
              <ul className="mt-4 space-y-2 list-disc pl-5 text-gray-900">
                {result.missingSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-gray-500">
                {result ? "No missing skills." : "Run an analysis to see gaps."}
              </p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#3E3A74]">Recommendation</h2>
            <div className="mt-5">
              {result ? (
                <span className={`px-4 py-2 rounded-full font-semibold ${tone.badge}`}>
                  {result.recommendation.label}
                </span>
              ) : (
                <span className="text-gray-500">No recommendation yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </RecruiterDashboardLayout>
  );
}
