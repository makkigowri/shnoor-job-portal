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