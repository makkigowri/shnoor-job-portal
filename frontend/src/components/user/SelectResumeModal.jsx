import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CheckCircle2 } from "lucide-react";
import { getMyResumes } from "../../services/resumeService";
const formatResumeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};
const SelectResumeModal = ({ onClose, onContinue, submitting = false, submitError = "" }) => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    let active = true;
    const loadResumes = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getMyResumes();
        const list = data.resumes || [];
        if (!active) return;
        setResumes(list);
        const defaultResume = list.find((resume) => resume.is_default) || list[0];
        setSelectedId(defaultResume ? defaultResume.id : null);
      } catch (err) {
        if (!active) return;
        setLoadError(err?.response?.data?.message || "Unable to load your resumes right now");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadResumes();
    return () => {
      active = false;
    };
  }, []);

  const handleUploadResume = () => {
    onClose();
    navigate("/user/profile");
  };

  const handleContinue = () => {
    if (!selectedId || submitting) return;
    onContinue(selectedId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl ring-1 ring-blue-100 max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-7 overflow-y-auto max-h-[90vh]">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-heading">Select Resume</h2>
              <p className="text-sm text-body mt-1">
                Choose the resume you'd like to submit with this application.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="text-body hover:text-heading text-2xl leading-none disabled:opacity-50"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="mt-5">
            {(submitError || loadError) && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 mb-4 text-sm">
                {submitError || loadError}
              </div>
            )}

            {loading ? (
              <p className="text-sm text-body py-8 text-center">Loading your resumes...</p>
            ) : resumes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center">
                <p className="text-sm font-semibold text-heading">No resumes available.</p>
                <p className="text-sm text-body mt-1">
                  Please upload a resume before applying.
                </p>
                <button
                  type="button"
                  onClick={handleUploadResume}
                  className="mt-5 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-hover transition"
                >
                  Upload Resume
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => {
                  const isSelected = selectedId === resume.id;
                  return (
                    <label
                      key={resume.id}
                      className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="select-resume"
                        className="mt-1.5 accent-primary shrink-0"
                        checked={isSelected}
                        onChange={() => setSelectedId(resume.id)}
                      />
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-heading truncate" title={resume.resume_name}>
                            {resume.resume_name}
                          </p>
                          {resume.is_default && (
                            <span className="inline-flex items-center bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        {formatResumeDate(resume.uploaded_at) && (
                          <p className="text-xs text-body mt-0.5">
                            Uploaded on {formatResumeDate(resume.uploaded_at)}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={18} className="text-primary shrink-0 mt-1" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            {resumes.length > 0 && (
              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedId || submitting}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Submitting..." : "Continue"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="border border-border px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectResumeModal;
