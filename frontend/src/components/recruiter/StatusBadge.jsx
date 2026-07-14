const STATUS_STYLES = {
  Draft: "bg-gray-100 text-gray-700",
  Published: "bg-green-100 text-green-700",
  Closed: "bg-red-100 text-red-600",
  Assigned: "bg-blue-100 text-blue-700",
  Started: "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Expired: "bg-red-100 text-red-600",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Submitted: "bg-green-100 text-green-700",
  "Auto Submitted": "bg-orange-100 text-orange-700",
  Pass: "bg-green-100 text-green-700",
  Fail: "bg-red-100 text-red-600"
};
const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${style}`}>
      {status || "—"}
    </span>
  );
};
export default StatusBadge;
