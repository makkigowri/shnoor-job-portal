import { Link } from "react-router-dom";
const jobs = [
  {
    title: "Software Engineer",
    location: "Hyderabad, India",
    experience: "2-4 Years",
    type: "Full Time",
    salary: "₹6 - ₹9 LPA"
  },
  {
    title: "Python Developer",
    location: "Hyderabad, India",
    experience: "1-3 Years",
    type: "Full Time",
    salary: "₹5 - ₹8 LPA"
  },
  {
    title: "AI Engineer",
    location: "Hyderabad, India",
    experience: "3-5 Years",
    type: "Full Time",
    salary: "₹8 - ₹14 LPA"
  },
  {
    title: "UI/UX Designer",
    location: "Remote",
    experience: "2-4 Years",
    type: "Full Time",
    salary: "₹6 - ₹10 LPA"
  },
  {
    title: "Data Analyst",
    location: "Hyderabad, India",
    experience: "1-2 Years",
    type: "Full Time",
    salary: "₹5 - ₹7 LPA"
  },
  {
    title: "Backend Developer",
    location: "Hyderabad, India",
    experience: "2-5 Years",
    type: "Full Time",
    salary: "₹7 - ₹11 LPA"
  }
];
const CurrentOpenings = () => {
  return (
    <section
      id="jobs"
      className="bg-white py-16"
    >
      <div className="max-w-[1400px] mx-auto px-10 lg:px-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="mt-5 text-5xl font-bold text-[#3E3A74]">
            Current Openings
          </h2>
          <p className="mt-5 text-[17px] leading-8 text-[#111827]">
            Explore current opportunities at SHNOOR Technologies and become part of a team building innovative digital solutions.
          </p>
        </div>
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job.title}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#7393D3] hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGzhluKdUf0IhxKsPrl1daQEZatX0_mJi8ITsuYsm8eQ&s=10"
                    alt="SHNOOR"
                    className="h-14 w-14 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-2 object-contain"
                  />
                  <div>
                    <h3 className="text-[22px] font-bold text-[#3E3A74]">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      SHNOOR Technologies
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#EEF2FF] px-4 py-2 text-xs font-semibold text-[#3E3A74]">
                  {job.type}
                </span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-sm text-[#111827]">
                  {job.location}
                </span>
                <span className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-sm text-[#111827]">
                  {job.experience}
                </span>
              </div>
              <div className="mt-7 rounded-2xl bg-[#F8FAFC] p-5">
                <p className="text-sm text-[#6B7280]">
                  Annual Salary
                </p>
                <h4 className="mt-2 text-2xl font-bold text-[#3E3A74]">
                  {job.salary}
                </h4>
              </div>
              <Link
                to="/login"
                className="mt-7 flex h-12 items-center justify-center rounded-xl bg-[#7393D3] font-semibold text-white transition-all duration-300 hover:bg-[#5E84D6]"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            to="/login"
            className="rounded-xl border border-[#7393D3] px-8 py-3 font-semibold text-[#3E3A74] transition-all duration-300 hover:bg-[#7393D3] hover:text-white"
          >
            View All Openings
          </Link>
        </div>
      </div>
    </section>
  );
};
export default CurrentOpenings;