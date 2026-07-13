import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterSidebar from "../components/recruiter/RecruiterSidebar";
import useAuth from "../hooks/useAuth";
const RecruiterDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [headerSearch, setHeaderSearch] = useState("");
  const initial = user?.fullname ? user.fullname.charAt(0).toUpperCase() : "R";
  const handleHeaderSearch = (e) => {
    e.preventDefault();
    const trimmed = headerSearch.trim();
    navigate(trimmed ? `/recruiter/applicants?search=${encodeURIComponent(trimmed)}` : "/recruiter/applicants");
  };
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-[#3E3A74]">Recruiter Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Manage jobs, applicants and recruitment activity.</p>
          </div>
          <div className="flex items-center gap-6">
            <form onSubmit={handleHeaderSearch}>
              <input
                type="text"
                placeholder="Search applicants..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-72 rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
              />
            </form>
            <button
              type="button"
              onClick={() => navigate("/recruiter/company-profile")}
              className="w-12 h-12 rounded-full bg-[#7393D3] text-white flex items-center justify-center font-bold text-lg hover:bg-[#5E84D6] transition"
              title={user?.fullname || "Company Profile"}
            >
              {initial}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
export default RecruiterDashboardLayout;
