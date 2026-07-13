import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/user/Sidebar";
import useAuth from "../hooks/useAuth";
const UserDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [headerSearch, setHeaderSearch] = useState("");
  const initial = user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U";
  const handleHeaderSearch = (e) => {
    e.preventDefault();
    const trimmed = headerSearch.trim();
    navigate(trimmed ? `/user/jobs?title=${encodeURIComponent(trimmed)}` : "/user/jobs");
  };
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-[#3E3A74]">
              Job Seeker Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back! Manage your profile, jobs and applications.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <form onSubmit={handleHeaderSearch}>
              <input
                type="text"
                placeholder="Search jobs..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-72 rounded-xl border border-gray-300 px-4 py-2.5 focus:border-[#7393D3] focus:outline-none"
              />
            </form>
            <button
              type="button"
              onClick={() => navigate("/user/profile")}
              className="w-12 h-12 rounded-full bg-[#7393D3] text-white flex items-center justify-center font-bold text-lg hover:bg-[#5E84D6] transition"
              title={user?.fullname || "My Profile"}
            >
              {initial}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default UserDashboardLayout;
