import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDashboardLayout from "../../../layouts/UserDashboardLayout";
import { getMyTechnicalInterviews } from "../../../services/technicalInterviewService";

const statusBadge = (status) => {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-700";
    case "In Progress":
      return "bg-amber-100 text-amber-700";
    case "Awaiting Result":
      return "bg-purple-100 text-purple-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Cancelled":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const resultBadge = (result) => {
  if (result === "Selected") return "bg-emerald-100 text-emerald-700";
  if (result === "Rejected") return "bg-red-100 text-red-600";
  return "bg-gray-100 text-gray-500";
};

export default function MyTechnicalInterviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyTechnicalInterviews()
      .then((data) => {
        if (active) setInterviews(data.interviews || []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || "Unable to load your Technical Interviews");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <UserDashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#3E3A74]">Technical Interviews</h1>
        <p className="mt-2 text-gray-600">
          Interviews scheduled by recruiters after clearing your AI Interview appear here.
        </p>
      </div>

      {error && <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3">{error}</div>}
      {loading && <p className="mt-8 text-gray-500">Loading...</p>}

      {!loading && interviews.length === 0 && !error && (
        <div className="mt-8 bg-white rounded-3xl p-10 shadow-md border border-gray-200 text-center text-gray-500">
          You do not have any Technical Interviews scheduled yet.
        </div>
      )}

      {!loading && interviews.length > 0 && (
        <div className="mt-8 space-y-5">
          {interviews.map((iv) => (
            <div key={iv.id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#3E3A74]">{iv.job_title}</h3>
                  <p className="mt-1 text-gray-500">
                    {(iv.scheduled_date instanceof Date
                      ? iv.scheduled_date.toISOString().slice(0, 10)
                      : String(iv.scheduled_date).slice(0, 10))}{" "}
                    at {iv.scheduled_time} · {iv.duration_minutes} minutes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(iv.status)}`}>
                    {iv.status}
                  </span>
                  {iv.result && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${resultBadge(iv.result)}`}>
                      {iv.result}
                    </span>
                  )}
                </div>
              </div>
              {["Scheduled", "In Progress"].includes(iv.status) && (
                <div className="mt-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
                  Camera and microphone access are required to continue. Please join from a device with a working
                  camera and microphone.
                </div>
              )}
              <div className="mt-5 flex gap-3">
                {["Scheduled", "In Progress"].includes(iv.status) && (
                  <button
                    onClick={() => navigate(`/technical-interview/room/${iv.room_code}`)}
                    className="px-6 py-3 rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] text-white font-semibold transition"
                  >
                    Join Meeting
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </UserDashboardLayout>
  );
}
