import { useEffect, useRef, useState } from "react";

// Renders a live countdown and calls onExpire exactly once when time runs out.
// `deadline` must be a Date (or ISO string) representing the absolute moment
// the assessment must be auto-submitted by.
const AssessmentTimer = ({ deadline, onExpire }) => {
  const deadlineTime = typeof deadline === "string" ? new Date(deadline).getTime() : deadline?.getTime();
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadlineTime - Date.now()));
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    const tick = () => {
      const diff = Math.max(0, deadlineTime - Date.now());
      setRemainingMs(diff);
      if (diff <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlineTime]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");

  const isCritical = totalSeconds <= 60;
  const isWarning = totalSeconds <= 300 && !isCritical;

  return (
    <div
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-lg tabular-nums transition-colors ${
        isCritical
          ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
          : isWarning
          ? "bg-orange-50 text-orange-600 border border-orange-200"
          : "bg-[#7393D3]/10 text-[#3E3A74] border border-[#7393D3]/20"
      }`}
      title="Time remaining"
    >
      <span aria-hidden="true">⏱</span>
      <span>
        {hours > 0 ? `${pad(hours)}:` : ""}
        {pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
};

export default AssessmentTimer;
