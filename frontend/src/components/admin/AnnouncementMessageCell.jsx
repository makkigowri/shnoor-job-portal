import { useState } from "react";
const TRUNCATE_LENGTH = 70;
const AnnouncementMessageCell = ({ message }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = (message || "").length > TRUNCATE_LENGTH;
  const display = expanded || !isLong ? message : `${message.slice(0, TRUNCATE_LENGTH).trimEnd()}...`;
  return (
    <div className="max-w-md" title={isLong && !expanded ? message : undefined}>
      <p className="text-gray-800 whitespace-pre-wrap break-words">{display}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-xs font-medium text-[#7393D3] hover:text-[#5E84D6]"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};
export default AnnouncementMessageCell;
