import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
const AssessmentCard = ({ assessment }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#3E3A74] line-clamp-2">{assessment.title}</h2>
        <StatusBadge status={assessment.status} />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        {assessment.job_title ? `Linked Job: ${assessment.job_title}` : "Not linked to a specific job"}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-xl py-2">
          <p className="text-lg font-bold text-[#3E3A74]">{assessment.question_count ?? 0}</p>
          <p className="text-xs text-gray-500">Questions</p>
        </div>
        <div className="bg-gray-50 rounded-xl py-2">
          <p className="text-lg font-bold text-[#3E3A74]">{assessment.duration_minutes}m</p>
          <p className="text-xs text-gray-500">Duration</p>
        </div>
        <div className="bg-gray-50 rounded-xl py-2">
          <p className="text-lg font-bold text-[#3E3A74]">{assessment.assigned_count ?? 0}</p>
          <p className="text-xs text-gray-500">Assigned</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => navigate(`/recruiter/assessments/${assessment.id}`)}
          className="flex-1 bg-[#7393D3] hover:bg-[#5E84D6] text-white py-2.5 rounded-xl text-sm font-medium transition"
        >
          View
        </button>
        <button
          onClick={() => navigate(`/recruiter/assessments/${assessment.id}/edit`)}
          className="flex-1 border border-gray-300 hover:bg-gray-100 py-2.5 rounded-xl text-sm font-medium transition"
        >
          Edit
        </button>
        <button
          onClick={() => navigate(`/recruiter/assessments/${assessment.id}/questions`)}
          className="flex-1 border border-gray-300 hover:bg-gray-100 py-2.5 rounded-xl text-sm font-medium transition"
        >
          Questions
        </button>
      </div>
    </div>
  );
};
export default AssessmentCard;
