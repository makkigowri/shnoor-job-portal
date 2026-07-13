const RecruiterHeader = ({
  title = "Recruiter Dashboard",
  subtitle = "Welcome back to SHNOOR Job Portal"}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3E3A74]">{title}</h1>
          <p className="mt-2 text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <h3 className="font-semibold text-[#3E3A74]">HR Manager</h3>
            <p className="text-sm text-gray-500">admin@shnoor.com</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">HR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RecruiterHeader;