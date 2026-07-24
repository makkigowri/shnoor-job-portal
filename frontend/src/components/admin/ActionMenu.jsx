import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

const ActionMenu = ({ items = [] }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const visibleItems = items.filter((item) => item && item.hidden !== true);

  const handleSelect = (item) => {
    if (item.disabled) return;
    setOpen(false);
    item.onClick?.();
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#3E3A74] active:scale-95 transition-all duration-150"
      >
        <MoreVertical size={18} />
      </button>
      <div
        className={`absolute right-0 mt-2 w-44 origin-top-right bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-20 transition-all duration-150 ease-out ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {visibleItems.map((item, index) => (
          <button
            key={item.key || index}
            type="button"
            onClick={() => handleSelect(item)}
            disabled={item.disabled}
            className={`w-full text-left px-4 py-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
              item.danger ? "text-red-600 hover:bg-red-50" : "text-[#3E3A74] hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionMenu;
