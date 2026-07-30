import { useState, useEffect } from "react";
import UserDashboardLayout from "../../layouts/UserDashboardLayout";
import {
  getMyResume,
  getMyResumes,
  uploadResume,
  uploadAdditionalResume,
  deleteResume,
  deleteAdditionalResume,
} from "../../services/resumeService";
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
const Resume = () => {
  const [resume, setResume] = useState(null);
 
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const loadResumes = async () => {
  try {
    const data = await getMyResumes();
    setResumes(data.resumes || []);
  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
    
    loadResumes();
  }, []);
  const handleResume = (e) => {
    if (e.target.files.length > 0) {
      setResume(e.target.files[0]);
      setError("");
      setSuccessMessage("");
    }
  };
  const handleSaveResume = async () => {
    if (!resume) {
      setError("Please choose a resume file first");
      return;
    }
    setSaving(true);
    setError("");
    setSuccessMessage("");
    try {
      await uploadAdditionalResume(resume);

loadResumes();
      setResume(null);
      setSuccessMessage("Resume uploaded successfully. The recruiter will run ATS scoring after reviewing applicants for a job.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to upload resume");
    } finally {
      setSaving(false);
    }
  };
  const handleUploadAnotherResume = async () => {
  if (!resume) {
    setError("Please choose a resume first");
    return;
  }

  try {
    await uploadAdditionalResume(resume);

    setResume(null);

    loadResumes();

    setSuccessMessage("Resume uploaded successfully");
  } catch (err) {
    setError(err?.response?.data?.message || "Upload failed");
  }
};
  const handleDeleteResume = async () => {
    setDeleting(true);
    setError("");
    setSuccessMessage("");
    try {
      await deleteResume();
      setExistingResume(null);
      setSuccessMessage("Resume deleted successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete resume");
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <UserDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-heading">
            Resume Management
          </h1>
          <p className="text-body mt-2">
            Upload your latest resume. It is automatically scored by our ATS engine against every job you apply to - no manual recruiter review needed.
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">
            {successMessage}
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-border rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">
              Upload Resume
            </h2>
           {resumes.length > 0 && (
  <div className="mb-6 rounded-lg border border-border p-4">
    <h4 className="font-semibold text-lg mb-4">
      My Resumes
    </h4>

    <div className="space-y-3">
      {resumes.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between border rounded-lg p-3"
        >
          <div>
            <p className="font-medium">
              {item.resume_filename}
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={`${API_ORIGIN}${item.resume_path}`}
              target="_blank"
              rel="noreferrer"
              className="border border-primary text-primary px-3 py-1 rounded-lg hover:bg-primary hover:text-white"
            >
              View
            </a>

            <button
              onClick={async () => {
                await deleteAdditionalResume(item.id);
                loadResumes();
              }}
              className="border border-red-500 text-red-500 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
            <label
              htmlFor="resume"
              className="border-2 border-dashed border-primary rounded-xl h-72 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition"
            >
              <div className="text-6xl mb-4">
                📄
              </div>
              <h3 className="text-lg font-semibold">
                Drag & Drop Resume
              </h3>
              <p className="text-body mt-2">
                or Click here to upload
              </p>
              <p className="text-sm text-gray-500 mt-2">
                PDF, DOC, DOCX (Max 5MB)
              </p>
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResume}
            />
            {resume && (
              <div className="mt-6 rounded-lg bg-green-50 border border-green-300 p-4">
                <h4 className="font-semibold text-green-700">
                  Ready to Upload
                </h4>
                <p className="mt-2">
                  {resume.name}
                </p>
              </div>
            )}
            <button
              onClick={handleUploadAnotherResume}
              disabled={saving || !resume}
              className="mt-6 bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {saving ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
          <div className="space-y-5">
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg">
                Resume Status
              </h3>
              {loading ? (
                <p className="mt-4 text-body">Checking status...</p>
              ) : hasResume ? (
                <p className="mt-4 text-green-600 font-medium">
                  Ready for Applications
                </p>
              ) : (
                <p className="mt-4 text-yellow-600 font-medium">
                  No Resume Uploaded
                </p>
              )}
            </div>
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg">
                ATS Scan
              </h3>
              <p className="mt-4 text-body text-sm">
                When you apply to a job, your application status starts as "Applied". The recruiter reviews applicants and runs ATS scoring, after which you'll see your score and updated status on the "Applied Jobs" page.
              </p>
            </div>
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg">
                Tips
              </h3>
              <ul className="mt-4 space-y-3 text-body text-sm list-disc pl-5">
                <li>Add measurable achievements.</li>
                <li>Use relevant technical skills.</li>
                <li>Keep resume within 1-2 pages.</li>
                <li>Upload PDF format.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
};
export default Resume;