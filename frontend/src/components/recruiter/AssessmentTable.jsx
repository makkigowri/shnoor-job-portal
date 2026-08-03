import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";
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
                    items={[
                      {
                        key: "edit",
                        label: "Edit",
                        onClick: () => navigate(`/recruiter/assessments/${assessment.id}/edit`)
                      },
                      {
                        key: "results",
                        label: "Results",
                        onClick: () => navigate(`/recruiter/assessments/${assessment.id}/results`)
                      },
                      {
                        key: "close",
                        label: "Close",
                        disabled: assessment.status !== "Published" || actioningId === assessment.id,
                        onClick: () => onClose(assessment.id)
                      },
                      {
                        key: "delete",
                        label: "Delete",
                        danger: true,
                        divider: true,
                        disabled: actioningId === assessment.id,
                        onClick: () => onDelete(assessment.id)
                      }
                    ]}
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