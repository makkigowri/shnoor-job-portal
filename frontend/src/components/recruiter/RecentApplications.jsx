const applications = [
  { job: "Frontend Developer", applicants: 32 },
  { job: "React Developer", applicants: 24 },
  { job: "Python Developer", applicants: 18 }
];
const RecentApplications = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-[#3E3A74]">Recent Applications</h2>
      <div className="space-y-4 mt-6">
        {applications.map((item) => (
          <div key={item.job} className="flex justify-between">
            <span className="text-gray-900">{item.job}</span>
            <span className="font-semibold text-gray-900">{item.applicants}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RecentApplications;