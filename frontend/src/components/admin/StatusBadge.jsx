const STYLES = {
  active: "bg-green-50 text-green-700 border-green-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  "under review": "bg-amber-50 text-amber-700 border-amber-200",
  shortlisted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  "interview scheduled": "bg-purple-50 text-purple-700 border-purple-200",
  default: "bg-gray-100 text-gray-600 border-gray-200"
};
const StatusBadge = ({ status }) => {
  const key = (status || "").toLowerCase();
  const style = STYLES[key] || STYLES.default;
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${style}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
