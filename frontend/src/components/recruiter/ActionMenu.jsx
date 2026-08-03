import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
const VIEWPORT_MARGIN = 8;
const MENU_WIDTH = 176;
const ActionMenu = ({ items = [] }) => {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const visibleItems = items.filter((item) => item && item.hidden !== true);
  const computePosition = useCallback(() => {
    const buttonEl = buttonRef.current;
    if (!buttonEl) return;
    const rect = buttonEl.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || 0;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - VIEWPORT_MARGIN;
    const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    const availableSpace = Math.max(openUpward ? spaceAbove : spaceBelow, 80);
    let left = rect.right - MENU_WIDTH;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN));
    setMenuStyle({
      left,
      maxHeight: availableSpace,
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined
    });
  }, []);
  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
  }, [open, computePosition]);
  useEffect(() => {
    if (!open) return;
    const reposition = () => computePosition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, computePosition]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const handleSelect = (item) => {
    if (item.disabled) return;
    setOpen(false);
    item.onClick?.();
  };
  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="4" r="1.6" />
          <circle cx="10" cy="10" r="1.6" />
          <circle cx="10" cy="16" r="1.6" />
        </svg>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuStyle?.top,
              bottom: menuStyle?.bottom,
              left: menuStyle ? menuStyle.left : -9999,
              width: MENU_WIDTH,
              maxHeight: menuStyle?.maxHeight,
              zIndex: 9999
            }}
            className="overflow-y-auto origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg py-1.5"
          >
            {visibleItems.map((item, index) => (
              <div key={item.key || index}>
                {item.divider && <div className="my-1.5 border-t border-gray-100" />}
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  disabled={item.disabled}
                  className={`w-full text-left px-4 py-2.5 text-sm transition disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                    item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};
export default ActionMenu;