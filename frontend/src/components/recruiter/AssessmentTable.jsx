import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
const AssessmentTable = ({ assessments, onPublish, onClose, onDelete, actioningId }) => {
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
                <div className="flex justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/recruiter/assessments/${assessment.id}/edit`)}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/recruiter/assessments/${assessment.id}/questions`)}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm font-medium transition"
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => navigate(`/recruiter/assessments/${assessment.id}/assign`)}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm font-medium transition"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => navigate(`/recruiter/assessments/${assessment.id}/results`)}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm font-medium transition"
                  >
                    Results
                  </button>
                  {assessment.status === "Draft" && (
                    <button
                      onClick={() => onPublish(assessment.id)}
                      disabled={actioningId === assessment.id}
                      className="px-3 py-2 rounded-lg bg-[#7393D3] hover:bg-[#5E84D6] text-white text-sm font-medium transition disabled:opacity-60"
                    >
                      Publish
                    </button>
                  )}
                  {assessment.status === "Published" && (
                    <button
                      onClick={() => onClose(assessment.id)}
                      disabled={actioningId === assessment.id}
                      className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition disabled:opacity-60"
                    >
                      Close
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(assessment.id)}
                    disabled={actioningId === assessment.id}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition disabled:opacity-60"
                  >
                    Delete
                  </button>
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
