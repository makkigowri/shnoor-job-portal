import RecruiterSidebar from "../components/recruiter/RecruiterSidebar";
import GlobalSearch from "../components/common/GlobalSearch";
const RecruiterDashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <RecruiterSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 shadow-sm px-10 py-4 flex justify-end">
          <GlobalSearch variant="recruiter" placeholder="Search jobs, applicants, interviews..." />
        </header>
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
export default RecruiterDashboardLayout;
