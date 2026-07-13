import DashboardShell from "../../layouts/DashboardShell";
import useAuth from "../../hooks/useAuth";
const RecruiterDashboard = () => {
  const { user } = useAuth();
  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3E3A74]">
          Welcome, {user?.fullname}
        </h1>
        <p className="mt-2 text-[#111827]">
          Manage your company profile, post jobs, track applicants and monitor recruitment activities from one place.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-sm hover:shadow-lg transition">
          <h3 className="text-[#6B7280] font-medium">
            Active Jobs
          </h3>
          <h2 className="mt-3 text-4xl font-bold text-[#3E3A74]">
            12
          </h2>
        </div>
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-sm hover:shadow-lg transition">
          <h3 className="text-[#6B7280] font-medium">
            Total Applicants
          </h3>
          <h2 className="mt-3 text-4xl font-bold text-[#3E3A74]">
            248
          </h2>
        </div>
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-sm hover:shadow-lg transition">
          <h3 className="text-[#6B7280] font-medium">
            Interviews
          </h3>
          <h2 className="mt-3 text-4xl font-bold text-[#3E3A74]">
            31
          </h2>
        </div>
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-sm hover:shadow-lg transition">
          <h3 className="text-[#6B7280] font-medium">
            Shortlisted
          </h3>
          <h2 className="mt-3 text-4xl font-bold text-[#3E3A74]">
            18
          </h2>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#E5E7EB] p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-[#3E3A74]">
            Recruiter Overview
          </h2>
          <p className="mt-2 text-[#111827] leading-7">
            From this dashboard you can manage company information, create job openings, review applicants, schedule interviews and track recruitment progress.
          </p>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-5">
              <p className="text-[#6B7280] text-sm">
                Company
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[#3E3A74]">
                SHNOOR Technologies
              </h3>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-5">
              <p className="text-[#6B7280] text-sm">
                Recruiter
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[#3E3A74]">
                {user?.fullname}
              </h3>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-5">
              <p className="text-[#6B7280] text-sm">
                Email
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#3E3A74] break-all">
                {user?.email}
              </h3>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-5">
              <p className="text-[#6B7280] text-sm">
                Phone
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[#3E3A74]">
                {user?.phone}
              </h3>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-7 shadow-sm">
          <h2 className="text-2xl font-bold text-[#3E3A74]">
            Today's Summary
          </h2>
          <div className="mt-6 space-y-5">
            <div className="flex justify-between border-b border-[#E5E7EB] pb-3">
              <span className="text-[#111827]">
                New Applications
              </span>
              <span className="font-semibold text-[#3E3A74]">
                24
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E5E7EB] pb-3">
              <span className="text-[#111827]">
                Interviews
              </span>
              <span className="font-semibold text-[#3E3A74]">
                5
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E5E7EB] pb-3">
              <span className="text-[#111827]">
                Offers Sent
              </span>
              <span className="font-semibold text-[#3E3A74]">
                2
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#111827]">
                Pending Reviews
              </span>
              <span className="font-semibold text-[#3E3A74]">
                9
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};
export default RecruiterDashboard;