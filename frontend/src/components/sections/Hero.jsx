import { useState } from "react";
import { useNavigate } from "react-router-dom";
const popularSearches = ["Frontend Developer", "Backend Developer", "React Developer", "Python Developer", "AI Engineer"];
const stats = [
  { value: "250+", label: "Open Positions" },
  { value: "30+", label: "Departments" },
  { value: "10K+", label: "Applications" }];
const Hero = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/login");
  };
  return (
    <section className="bg-[#F8FAFC]">
     <div className="max-w-[1400px] mx-auto px-12 lg:px-20 pt-18 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="mt-7 text-[50px] lg:text-[60px] font-extrabold leading-[1.08] tracking-tight">
              <span className="text-[#3E3A74]">
                Find Your Future
              </span>
              <br />
              <span className="text-[#111827]">
                With
              </span>
              <span className="text-[#7393D3]">
                {" "}SHNOOR
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-[18px] leading-8 text-[#111827]">
              Discover exciting career opportunities at SHNOOR Technologies. Join an innovative team building world-class digital solutions across engineering, AI, cloud, product development and digital transformation.
            </p>
            <form
              onSubmit={handleSearch}
              className="mt-10 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-lg"
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_180px]">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Job title or keyword"
                  className="rounded-xl border border-[#E5E7EB] px-5 py-4 focus:border-[#7393D3]"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="rounded-xl border border-[#E5E7EB] px-5 py-4 focus:border-[#7393D3]"
                />
                <button className="rounded-xl bg-[#7393D3] font-semibold text-white transition hover:bg-[#5E84D6]">
                  Search Jobs
                </button>
              </div>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              {popularSearches.map((item) => (
                <button
                  key={item}
                  className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#EEF2FF]"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-3 gap-5">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <h2 className="text-3xl font-bold text-[#3E3A74]">
                    {item.value}
                  </h2>
                  <p className="mt-2 text-sm text-[#111827]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <div className="relative w-[88%]">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                alt="SHNOOR Team"
                className="h-[600px] w-full rounded-[28px] object-cover shadow-2xl"
              />
              <div className="absolute left-6 top-6 rounded-xl bg-white/95 px-6 py-4 shadow-lg">
                <p className="text-2xl font-bold text-[#3E3A74]">
                  500+
                </p>
                <p className="text-sm text-[#111827]">
                  Employees Worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;