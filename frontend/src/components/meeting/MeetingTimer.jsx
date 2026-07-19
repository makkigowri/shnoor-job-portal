import { useEffect, useState } from "react";

export default function MeetingTimer() {

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="bg-white rounded-xl px-4 py-2 shadow border">
      <p className="text-sm text-gray-500">Meeting Time</p>
      <h3 className="font-bold text-[#3E3A74]">
        {hrs}:{mins}:{secs}
      </h3>
    </div>
  );
}