import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
import { getApplicants, exportApplicants } from "../../services/recruiterService";
import { runAtsForJob } from "../../services/atsService";
import { getMyJobs } from "../../services/jobService";
import {
  LuArrowUpDown,
  LuEllipsisVertical,
  LuFileText,
  LuZoomIn,
  LuZoomOut,
  LuDownload,
} from "react-icons/lu";
import Pagination from "../../components/common/Pagination";
import usePagination from "../../hooks/usePagination";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
const statusBadge = (status) => {
  switch (status) {
    case "Shortlisted":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-600";
    case "Applied":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
const atsScoreColor = (score) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-500";
};
export default function Applicants() {
  const [searchParams] = useSearchParams();
  const nameSearch = (searchParams.get("search") || "").toLowerCase();
  const [jobs, setJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState("");
  const [runSummary, setRunSummary] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [showResume, setShowResume] = useState(false);
const [resumeUrl, setResumeUrl] = useState("");
const [numPages, setNumPages] = useState(null);
const [resumeScale, setResumeScale] = useState(1);
const actionButtonRefs = useRef({});
const [menuPosition, setMenuPosition] = useState(null);
  useEffect(() => {
    getMyJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch(() => {});
  }, []);
  const loadApplicants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getApplicants({ jobId: jobFilter || undefined });
      const list = data.applicants || [];
      setApplicants(
        nameSearch
          ? list.filter((a) => a.candidate_name?.toLowerCase().includes(nameSearch))
          : list
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load applicants right now");
    } finally {
      setLoading(false);
    }
  }, [jobFilter, nameSearch]);
  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);
  useEffect(() => {
    setRunSummary(null);
    setRunError("");
    setExportError("");
  }, [jobFilter]);
  const sortedApplicants = useMemo(() => {
    const sorted = [...applicants];
    switch (sortBy) {
      case "latest":
        sorted.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        sorted.sort((a, b) => a.id - b.id);
        break;
      case "az":
        sorted.sort((a, b) =>
          (a.candidate_name || "").localeCompare(b.candidate_name || "")
        );
        break;
      case "za":
        sorted.sort((a, b) =>
          (b.candidate_name || "").localeCompare(a.candidate_name || "")
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [applicants, sortBy]);
  const { page, setPage, totalPages, paginatedItems: pagedApplicants } = usePagination(
    sortedApplicants,
    10
  );
  useEffect(() => {
    setPage(1);
  }, [jobFilter, nameSearch]);
  const handleRunAts = async () => {
    if (!jobFilter) return;
    setRunning(true);
    setRunError("");
    setRunSummary(null);
    try {
      const data = await runAtsForJob(jobFilter);
      setRunSummary(data.summary || null);
      await loadApplicants();
    } catch (err) {
      setRunError(err?.response?.data?.message || "Unable to run ATS scoring right now");
    } finally {
      setRunning(false);
    }
  };
  const handleExport = async () => {
    if (!jobFilter) return;
    setExporting(true);
    setExportError("");
    try {
      await exportApplicants(jobFilter);
    } catch (err) {
      setExportError(err?.response?.data?.message || "Unable to export applicants right now");
    } finally {
      setExporting(false);
    }
  };
  const selectedJobTitle = jobs.find((job) => String(job.id) === String(jobFilter))?.title;
 const handleViewResume = (candidate) => {
  if (!candidate.resume_path) {
    return;
  }

  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const serverUrl = apiBaseUrl.replace(/\/api\/?$/, "");
  const resumeUrl = `${serverUrl}${candidate.resume_path}`;

  setResumeUrl(resumeUrl);
setResumeScale(1);
setShowResume(true);
setOpenActionMenu(null);
};
const handleDownloadResume = async () => {
  try {
    const response = await fetch(resumeUrl);

    if (!response.ok) {
      throw new Error("Failed to download resume");
    }

    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "resume.pdf";

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Resume download failed:", error);
  }
};
  return (
    <RecruiterDashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#3E3A74]">Applicants</h1>
          <p className="mt-2 text-gray-500">Review applicants by job and run ATS scoring when you're ready.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 bg-white focus:border-[#7393D3] focus:outline-none"
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRunAts}
            disabled={!jobFilter || running}
            title={!jobFilter ? "Select a specific job to run ATS scoring" : undefined}
            className="bg-[#7393D3] hover:bg-[#5E84D6] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl transition whitespace-nowrap"
          >
            {running ? "Running ATS..." : "Run ATS Score"}
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!jobFilter || exporting}
            title={!jobFilter ? "Select a specific job to export applications" : undefined}
            className="border border-[#7393D3] text-[#3E3A74] hover:bg-[#7393D3] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium px-5 py-2.5 rounded-xl transition whitespace-nowrap"
          >
            {exporting ? "Exporting..." : "Export Applications"}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="border border-gray-300 bg-white hover:bg-gray-100 p-2.5 rounded-xl transition"
            >
              <LuArrowUpDown size={20} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setSortBy("latest");
                    setShowSortMenu(false);
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  Latest
                </button>
                <button
                  onClick={() => {
                    setSortBy("oldest");
                    setShowSortMenu(false);
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  Oldest
                </button>
                <button
                  onClick={() => {
                    setSortBy("az");
                    setShowSortMenu(false);
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  A → Z
                </button>
                <button
                  onClick={() => {
                    setSortBy("za");
                    setShowSortMenu(false);
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  Z → A
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {!jobFilter && (
        <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">
          Select a specific job from "All Jobs" to run ATS scoring for its applicants.
        </div>
      )}
      {runSummary && (
        <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ATS scoring completed for <span className="font-semibold">{selectedJobTitle}</span>:{" "}
          {runSummary.processed} scored ({runSummary.shortlisted} shortlisted, {runSummary.rejected} rejected)
          {runSummary.skipped > 0 && `, ${runSummary.skipped} skipped (no resume text or job skills)`}.
        </div>
      )}
      {runError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {runError}
        </div>
      )}
      {exportError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {exportError}
        </div>
      )}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {loading && <p className="mt-8 text-gray-500">Loading applicants...</p>}
      {!loading && applicants.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          No applicants found. Once job seekers apply to your job posts, they'll show up here.
        </div>
      )}
      {!loading && applicants.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Candidate</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Job Role</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Qualification</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Skills</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">ATS Score</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedApplicants.map((candidate) => (
                <tr key={candidate.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-gray-900">{candidate.candidate_name}</div>
                    <div className="text-sm text-gray-500">{candidate.candidate_email}</div>
                  </td>
                  <td className="px-6 py-5 text-gray-900">{candidate.job_title}</td>
                  <td className="px-6 py-5 text-gray-900">
                    {candidate.candidate_qualification || "—"}
                  </td>
                  <td className="px-6 py-5 text-gray-900 max-w-xs truncate" title={candidate.candidate_skills}>
                    {candidate.candidate_skills || "—"}
                  </td>
                  <td className="px-6 py-5">
                    {candidate.ats_score != null ? (
                      <span
                        className={`font-semibold ${atsScoreColor(candidate.ats_score)}`}
                        title={[
                          candidate.ats_matched_skills ? `Matched: ${candidate.ats_matched_skills}` : "",
                          candidate.ats_missing_skills ? `Missing: ${candidate.ats_missing_skills}` : ""
                        ].filter(Boolean).join(" | ")}
                      >
                        {candidate.ats_score}%
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                 <td className="px-6 py-5 text-center">
  <div className="relative inline-block">
    <button
      type="button"
      ref={(el) => (actionButtonRefs.current[candidate.id] = el)}
      onClick={() => {
        if (openActionMenu === candidate.id) {
          setOpenActionMenu(null);
          setMenuPosition(null);
          return;
        }

        const btn = actionButtonRefs.current[candidate.id];

        if (btn) {
          const rect = btn.getBoundingClientRect();

          setMenuPosition({
            top: rect.bottom + 8,
            left: rect.right - 176,
          });
        }

        setOpenActionMenu(candidate.id);
      }}
      className="p-2 rounded-lg text-gray-500 hover:text-[#3E3A74] hover:bg-gray-100 transition"
      title="Actions"
    >
      <LuEllipsisVertical size={20} />
    </button>
  </div>

  {openActionMenu === candidate.id &&
    menuPosition &&
    createPortal(
      <div
        className="fixed z-[9999] w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
        }}
      >
        <button
          type="button"
          onClick={() => handleViewResume(candidate)}
          disabled={!candidate.resume_path}
          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          View Resume
        </button>
      </div>,
      document.body
    )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
      {showResume && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

     
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">

        <h2 className="text-lg font-semibold text-gray-900">
          Candidate Resume
        </h2>

        <div className="flex items-center gap-2">

         
          <button
            type="button"
            onClick={() =>
              setResumeScale((prev) => Math.max(0.5, prev - 0.1))
            }
            className="p-2 text-gray-600 hover:text-[#3E3A74] hover:bg-gray-100 rounded-lg transition"
            title="Zoom out"
          >
            <LuZoomOut size={20} />
          </button>

          
          <button
            type="button"
            onClick={() =>
              setResumeScale((prev) => Math.min(2, prev + 0.1))
            }
            className="p-2 text-gray-600 hover:text-[#3E3A74] hover:bg-gray-100 rounded-lg transition"
            title="Zoom in"
          >
            <LuZoomIn size={20} />
          </button>

          
         <button
  type="button"
  onClick={handleDownloadResume}
  className="p-2 text-gray-600 hover:text-[#3E3A74] hover:bg-gray-100 rounded-lg transition"
  title="Download resume"
>
  <LuDownload size={20} />
</button>

         
          <button
            type="button"
            onClick={() => {
              setShowResume(false);
              setResumeUrl("");
              setNumPages(null);
              setResumeScale(1);
            }}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            Close
          </button>

        </div>
      </div>

     
      <div className="flex-1 bg-gray-100 overflow-auto p-6">

        <Document
          file={resumeUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading resume...
            </div>
          }
          error={
            <div className="flex items-center justify-center h-full text-red-500">
              Unable to load resume.
            </div>
          }
        >
          {numPages &&
            Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                className="flex justify-center mb-6"
              >
                <Page
                  pageNumber={index + 1}
                  scale={resumeScale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg"
                />
              </div>
            ))}
        </Document>

      </div>

    </div>
  </div>
)}
    </RecruiterDashboardLayout>
  );
}