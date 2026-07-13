import RecruiterDashboardLayout from "../../layouts/RecruiterDashboardLayout";
const cards = [
  { title: "Total Jobs", value: "18" },
  { title: "Applications", value: "482" },
  { title: "Shortlisted", value: "96" },
  { title: "Interviews", value: "31" }
];
const jobs = [
  { title: "Frontend Developer", applicants: 132, shortlisted: 28, selected: 8 },
  { title: "React Developer", applicants: 98, shortlisted: 19, selected: 5 },
  { title: "Python Developer", applicants: 156, shortlisted: 34, selected: 12 }
];
export default function Analytics() {
  return (
    <RecruiterDashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#3E3A74]">Recruitment Analytics</h1>
        <p className="mt-2 text-gray-500">View recruitment performance and hiring statistics.</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-gray-500">{card.title}</p>
            <h2 className="mt-3 text-4xl font-bold text-[#3E3A74]">{card.value}</h2>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#3E3A74]">Hiring Progress</h2>
          <div className="space-y-6 mt-8">
            <div>
              <div className="flex justify-between text-gray-900">
                <span>Total Hiring Target</span>
                <span>75%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-200 mt-2">
                <div className="bg-[#7393D3] h-3 rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-gray-900">
                <span>Interview Completion</span>
                <span>58%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-200 mt-2">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: "58%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-gray-900">
                <span>Offer Acceptance</span>
                <span>82%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-200 mt-2">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: "82%" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#3E3A74]">Monthly Overview</h2>
          <div className="mt-8 h-72 flex items-end justify-between">
            {[35, 55, 45, 70, 60, 90].map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-10 rounded-t-lg bg-[#7393D3]" style={{ height: `${value * 2}px` }} />
                <span className="mt-3 text-sm text-gray-500">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">Job</th>
              <th className="px-6 py-4 text-left">Applicants</th>
              <th className="px-6 py-4 text-left">Shortlisted</th>
              <th className="px-6 py-4 text-left">Selected</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.title} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-5 font-semibold text-gray-900">{job.title}</td>
                <td className="px-6 py-5 text-gray-900">{job.applicants}</td>
                <td className="px-6 py-5 text-gray-900">{job.shortlisted}</td>
                <td className="px-6 py-5 text-green-600 font-semibold">{job.selected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RecruiterDashboardLayout>
  );
}