import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const ActionMenu = ({ assessment, onClose, onDelete, actioningId }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isBusy = actioningId === assessment.id;
  const canClose = assessment.status === "Published";

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isBusy}
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="4" r="1.6" />
          <circle cx="10" cy="10" r="1.6" />
          <circle cx="10" cy="16" r="1.6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg py-1.5">
          <button
            type="button"
            onClick={() => go(`/recruiter/assessments/${assessment.id}/edit`)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => go(`/recruiter/assessments/${assessment.id}/results`)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            Results
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onClose(assessment.id);
            }}
            disabled={!canClose || isBusy}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            Close
          </button>
          <div className="my-1.5 border-t border-gray-100" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete(assessment.id);
            }}
            disabled={isBusy}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const AssessmentTable = ({ assessments, onClose, onDelete, actioningId }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-6 py-4">Title</th>
            <th className="text-left px-6 py-4">Job</th>
            <th className="text-left px-6 py-4">Questions</th>
            <th className="text-left px-6 py-4">Duration</th>
            <th className="text-left px-6 py-4">Assigned</th>
            <th className="text-left px-6 py-4">Status</th>
            <th className="text-center px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment) => (
            <tr key={assessment.id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-5">
                <button
                  onClick={() => navigate(`/recruiter/assessments/${assessment.id}`)}
                  className="font-semibold text-gray-900 hover:text-[#7393D3] text-left"
                >
                  {assessment.title}
                </button>
              </td>
              <td className="px-6 py-5 text-gray-700">{assessment.job_title || "—"}</td>
              <td className="px-6 py-5 text-gray-700">{assessment.question_count ?? 0}</td>
              <td className="px-6 py-5 text-gray-700">{assessment.duration_minutes} min</td>
              <td className="px-6 py-5 text-gray-700">{assessment.assigned_count ?? 0}</td>
              <td className="px-6 py-5">
                <StatusBadge status={assessment.status} />
              </td>
              <td className="px-6 py-5">
                <div className="flex justify-center">
                  <ActionMenu
                    assessment={assessment}
                    onClose={onClose}
                    onDelete={onDelete}
                    actioningId={actioningId}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default AssessmentTable;
