export const NOTIFICATION_CATEGORIES = ["Applications", "Shortlisted", "Other"];
const CATEGORY_KEYWORDS = [
  { category: "Shortlisted", keywords: ["shortlist", "shortlisted"] },
  { category: "Applications", keywords: ["application", "applied", "resume"] }
];
export const categorizeNotification = (notification) => {
  const haystack = `${notification?.title || ""} ${notification?.message || ""}`.toLowerCase();
  const match = CATEGORY_KEYWORDS.find(({ keywords }) => keywords.some((keyword) => haystack.includes(keyword)));
  return match ? match.category : "Other";
};
export const groupNotificationsByCategory = (notifications = []) => {
  const groups = Object.fromEntries(NOTIFICATION_CATEGORIES.map((category) => [category, []]));
  notifications.forEach((notification) => {
    const category = categorizeNotification(notification);
    groups[category].push(notification);
  });
  return groups;
};
export const getUnreadCountsByCategory = (notifications = []) => {
  const counts = Object.fromEntries(NOTIFICATION_CATEGORIES.map((category) => [category, 0]));
  notifications.forEach((notification) => {
    if (!notification.is_read) {
      const category = categorizeNotification(notification);
      counts[category] += 1;
    }
  });
  return counts;
};