import { NOTIFICATION_CATEGORIES } from "../../utils/notificationCategories";
const NotificationTabs = ({ activeCategory, onSelect, unreadCounts, theme }) => {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
      {NOTIFICATION_CATEGORIES.map((category) => {
        const isActive = category === activeCategory;
        const count = unreadCounts[category] || 0;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              isActive ? theme.tabActive : theme.tabInactive
            }`}
          >
            {category}
            {count > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold ${theme.badge}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
export default NotificationTabs;