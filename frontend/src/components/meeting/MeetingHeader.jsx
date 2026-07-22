import { RiShieldCheckLine } from "react-icons/ri";
export default function MeetingHeader({
  jobTitle,
  candidate,
  recruiter,
}) {
  return (
    <header className="h-20 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#7393D3] flex items-center justify-center text-white">
          <RiShieldCheckLine size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#3E3A74]">
            SHNOOR Job Portal
          </h1>
          <p className="text-sm text-gray-500">
            Technical Interview
          </p>
        </div>
      </div>
      <div className="hidden lg:flex gap-10">
        <div>
          <p className="text-xs text-gray-400">
            Position
          </p>
          <p className="font-semibold text-[#3E3A74]">
            {jobTitle}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">
            Candidate
          </p>
          <p className="font-semibold text-[#3E3A74]">
            {candidate}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">
            Recruiter
          </p>
          <p className="font-semibold text-[#3E3A74]">
            {recruiter}
          </p>
        </div>
      </div>
    </header>
  );
}