const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} Hour${diffHours > 1 ? "s" : ""} Ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} Days Ago`;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
};
const badgeLabel = (type) => (type === "announcement" ? "INFO" : (type || "info").toUpperCase());
const NotificationCard = ({ item, theme }) => {
  const isRead = item.is_read;
  return (
    <div
      className={`relative overflow-hidden bg-white border ${theme.cardRounded} shadow-sm p-6 pl-7 transition ${
        isRead ? theme.readBorder : `${theme.unreadBorder} ${theme.unreadBg}`
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${theme.badgeColor(item.type)}`}>
              {badgeLabel(item.type)}
            </span>
            {!isRead && <span className={`w-2 h-2 rounded-full inline-block ${theme.unreadDot}`} />}
          </div>
          <h2 className={`mt-4 text-xl ${theme.titleColor} ${isRead ? "font-semibold" : "font-bold"}`}>
            {item.title}
          </h2>
          <p className={`mt-2 leading-7 ${theme.bodyColor}`}>{item.message}</p>
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{formatTime(item.created_at)}</span>
      </div>
    </div>
  );
};
export default NotificationCard;
