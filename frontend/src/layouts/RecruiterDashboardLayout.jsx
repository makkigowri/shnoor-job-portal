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
       
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
export default RecruiterDashboardLayout;
